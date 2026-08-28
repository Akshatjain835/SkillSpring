import "dotenv/config";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;

const llm = apiKey
  ? new ChatGoogleGenerativeAI({
      apiKey,
      model: "gemini-2.0-flash",
      temperature: 0.4, // a little variety helps question diversity
    })
  : {
      async invoke() {
        throw new Error("No Gemini API key configured.");
      },
    };

const MAX_RETRIES = 2;

const QuizGenState = Annotation.Root({
  lectureTitle: Annotation(),
  transcriptContext: Annotation(),
  numQuestions: Annotation({ default: () => 5 }),
  questions: Annotation({ default: () => [] }),
  critiqueVerdict: Annotation({ default: () => "no" }),
  critiqueFeedback: Annotation({ default: () => "" }),
  retryCount: Annotation({ default: () => 0 }),
  usedFallback: Annotation({ default: () => false }),
});

// ---- helpers -----------------------------------------------------------

function extractText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c) => (typeof c === "string" ? c : c?.text || "")).join("");
  }
  return content.toString?.() || "";
}

function sanitizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions
    .filter((q) => q && typeof q.questionText === "string" && q.questionText.trim())
    .map((q) => {
      const type = q.type === "mcq" ? "mcq" : "short_answer";
      const options = type === "mcq" && Array.isArray(q.options) ? q.options.map(String) : [];
      return {
        questionText: q.questionText.trim(),
        type,
        options,
        correctAnswer: (q.correctAnswer || "").toString().trim(),
        sourceExcerpt: (q.sourceExcerpt || "").toString().trim(),
      };
    });
}

/** Strips ```json fences etc. and parses. Returns null on failure. */
export function safeParseJsonArray(raw) {
  if (!raw) return null;
  const str = extractText(raw);
  try {
    const jsonMatch = str.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed) ? sanitizeQuestions(parsed) : null;
  } catch {
    return null;
  }
}

/**
 * Cheap, non-LLM grounding check: does the question's cited excerpt
 * actually share meaningful vocabulary with the transcript? Catches
 * outright fabricated citations without spending another LLM call.
 */
function isGrounded(sourceExcerpt, transcriptContext) {
  if (!sourceExcerpt) return false;
  const words = sourceExcerpt
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 4);
  if (words.length === 0) return false;
  const haystack = transcriptContext.toLowerCase();
  const hits = words.filter((w) => haystack.includes(w)).length;
  return hits / words.length > 0.6;
}

export function isQuotaError(error) {
  const message = error?.message || error?.toString?.() || "";
  return /429|quota|rate limit|too many requests|free tier/i.test(message);
}

export function buildFallbackQuestions({ lectureTitle, transcriptContext, numQuestions = 5 }) {
  const safeTranscript = transcriptContext || `Lecture on ${lectureTitle}`;
  const sentences = safeTranscript
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const seedFacts = sentences.length > 0 ? sentences.slice(0, 6) : [`Lecture topic: ${lectureTitle}`];
  const fallbackQuestions = [];

  for (let i = 0; i < Math.max(1, numQuestions); i += 1) {
    const source = seedFacts[i % seedFacts.length] || safeTranscript;
    const lowerSource = source.toLowerCase();

    let questionText = "Summarize the main point of this lecture.";
    let correctAnswer = "A concise summary based on the lecture transcript.";
    let type = "short_answer";

    if (lowerSource.includes("model") || lowerSource.includes("learning")) {
      questionText = `What is the main idea discussed in the lecture section about ${lectureTitle}?`;
      correctAnswer = source;
      type = "short_answer";
    } else if (lowerSource.includes("data") || lowerSource.includes("train")) {
      questionText = "What role does data play in the topic covered in this lecture?";
      correctAnswer = source;
      type = "short_answer";
    } else {
      questionText = `Explain the key concept described in this lecture excerpt.`;
      correctAnswer = source;
      type = "short_answer";
    }

    fallbackQuestions.push({
      questionText,
      type,
      options: [],
      correctAnswer,
      sourceExcerpt: source,
    });
  }

  return sanitizeQuestions(fallbackQuestions);
}

// ---- nodes ---------------------------------------------------------------

async function generateQuestionsNode(state) {
  const prompt = [
    `You are writing a quiz for the lecture "${state.lectureTitle}".`,
    `Create exactly ${state.numQuestions} questions using ONLY the transcript below.`,
    "Mix question types: roughly 60% \"mcq\" (4 options) and 40% \"short_answer\".",
    "",
    "Transcript:",
    (state.transcriptContext || "").slice(0, 12000),
    "",
    "Return ONLY a JSON array, no markdown fences, no commentary. Each item:",
    `{"questionText": "...", "type": "mcq" | "short_answer", "options": ["...","...","...","..."] (omit for short_answer), "correctAnswer": "...", "sourceExcerpt": "short quote or close paraphrase from the transcript this is based on"}`,
  ].join("\n");

  try {
    const res = await llm.invoke(prompt);
    const questions = safeParseJsonArray(res.content) || [];
    if (questions.length === 0) {
      throw new Error("Parsed empty question set from LLM");
    }
    return { questions, usedFallback: false };
  } catch (error) {
    if (isQuotaError(error) || /No Gemini API key configured/i.test(error?.message || "")) {
      return {
        questions: buildFallbackQuestions({
          lectureTitle: state.lectureTitle,
          transcriptContext: state.transcriptContext,
          numQuestions: state.numQuestions,
        }),
        usedFallback: true,
      };
    }

    throw error;
  }
}

async function selfCritiqueNode(state) {
  if (!state.questions || state.questions.length === 0) {
    return { critiqueVerdict: "no", critiqueFeedback: "No valid questions were produced." };
  }

  if (state.questions.every((question) => question.type === "short_answer" && (!question.options || question.options.length === 0))) {
    return { critiqueVerdict: "yes", critiqueFeedback: "Fallback quiz generated successfully.", usedFallback: state.usedFallback };
  }

  // Code-level grounding check first — cheap and catches fabrication directly.
  const ungrounded = state.questions.filter(
    (q) => !isGrounded(q.sourceExcerpt, state.transcriptContext)
  );
  if (ungrounded.length > 0) {
    return {
      critiqueVerdict: "no",
      critiqueFeedback: `${ungrounded.length} question(s) cite content not actually present in the transcript. Ground every question strictly in the transcript.`,
    };
  }

  // LLM-level check for quality issues code can't easily catch.
  const prompt = [
    "Review this quiz for: duplicate/near-duplicate questions, ambiguous wording,",
    "MCQ options that aren't mutually exclusive, and answers that are ambiguous.",
    "",
    JSON.stringify(state.questions, null, 2),
    "",
    'Reply with a single JSON object: {"verdict": "yes" or "no", "feedback": "specific issues to fix, or empty string if verdict is yes"}',
    "Reply with ONLY that JSON object.",
  ].join("\n");

  let verdict = "no";
  let feedback = "Could not parse critique; regenerating to be safe.";

  try {
    const res = await llm.invoke(prompt);
    const text = extractText(res.content);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      verdict = parsed.verdict === "yes" ? "yes" : "no";
      feedback = parsed.feedback || "";
    }
  } catch {
    // keep defaults above — forces a retry rather than shipping unchecked output
  }

  return { critiqueVerdict: verdict, critiqueFeedback: feedback };
}

async function regenerateNode(state) {
  const prompt = [
    `The previous quiz draft for "${state.lectureTitle}" had issues: ${state.critiqueFeedback}`,
    "",
    "Previous draft:",
    JSON.stringify(state.questions, null, 2),
    "",
    "Transcript (ground every question in this, nothing else):",
    (state.transcriptContext || "").slice(0, 12000),
    "",
    `Fix the issues and return a corrected JSON array of exactly ${state.numQuestions} questions,`,
    "same schema as before. Return ONLY the JSON array.",
  ].join("\n");

  try {
    const res = await llm.invoke(prompt);
    const questions = safeParseJsonArray(res.content) || state.questions;
    return { questions, retryCount: state.retryCount + 1, usedFallback: false };
  } catch (error) {
    if (isQuotaError(error) || /No Gemini API key configured/i.test(error?.message || "")) {
      return {
        questions: buildFallbackQuestions({
          lectureTitle: state.lectureTitle,
          transcriptContext: state.transcriptContext,
          numQuestions: state.numQuestions,
        }),
        retryCount: state.retryCount + 1,
        usedFallback: true,
      };
    }

    throw error;
  }
}

// ---- routing ---------------------------------------------------------------

function routeAfterCritique(state) {
  if (state.critiqueVerdict === "yes") return "end";
  if (state.retryCount >= MAX_RETRIES) return "end"; // ship best effort rather than loop forever
  return "regenerate";
}

// ---- graph assembly ---------------------------------------------------------

const graph = new StateGraph(QuizGenState)
  .addNode("generate_questions", generateQuestionsNode)
  .addNode("self_critique", selfCritiqueNode)
  .addNode("regenerate", regenerateNode)
  .addEdge(START, "generate_questions")
  .addEdge("generate_questions", "self_critique")
  .addConditionalEdges("self_critique", routeAfterCritique, {
    end: END,
    regenerate: "regenerate",
  })
  .addEdge("regenerate", "self_critique");

export const quizGenGraphApp = graph.compile();

export async function generateQuizQuestions({ lectureTitle, transcriptContext, numQuestions = 5 }) {
  const result = await quizGenGraphApp.invoke({
    lectureTitle,
    transcriptContext,
    numQuestions,
  });

  return {
    questions: sanitizeQuestions(result.questions),
    retriesUsed: result.retryCount || 0,
    passedCritique: result.critiqueVerdict === "yes",
    usedFallback: result.usedFallback === true,
  };
}
