import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

function getLlm() {
  const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: "gemini-3.6-flash",
    temperature: 0,
  });
}

function extractText(content) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c) => (typeof c === "string" ? c : c?.text || "")).join("");
  }
  return content.toString?.() || "";
}

async function safeInvokeLlm(prompt) {
  const llm = getLlm();
  if (!llm) {
    throw new Error("No Gemini API key configured.");
  }
  const res = await llm.invoke(prompt);
  return extractText(res?.content);
}

const PASS_THRESHOLD = 0.7;

const GradingState = Annotation.Root({
  questionText: Annotation(),
  correctAnswer: Annotation(),
  studentAnswer: Annotation(),
  sourceExcerpt: Annotation(),
  score: Annotation({ default: () => 0 }),
  reasoning: Annotation({ default: () => "" }),
  feedback: Annotation({ default: () => "" }),
});

function safeParseJson(raw) {
  if (!raw) return null;
  const str = extractText(raw);
  try {
    const match = str.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function heuristicGrading(studentAnswer, correctAnswer) {
  const studentWords = (studentAnswer || "").toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const correctWords = (correctAnswer || "").toLowerCase().split(/\W+/).filter((w) => w.length > 3);

  if (studentWords.length === 0 || correctWords.length === 0) {
    return { score: 0, reasoning: "Incomplete or blank response provided." };
  }

  const hits = studentWords.filter((w) => correctWords.includes(w)).length;
  const matchRatio = hits / Math.max(1, correctWords.length);
  const score = matchRatio >= 0.5 ? 0.8 : matchRatio >= 0.25 ? 0.5 : 0;
  return {
    score,
    reasoning: score >= PASS_THRESHOLD ? "Response shares key concept words with model answer." : "Response differs from key model answer terms.",
  };
}

// ---- nodes ---------------------------------------------------------------

async function gradeAnswerNode(state) {
  const studentAnswer = (state.studentAnswer || "").trim();
  if (!studentAnswer) {
    return { score: 0, reasoning: "No answer was provided." };
  }

  const prompt = [
    "Grade a student's short-answer response semantically — reward correct",
    "understanding even if the wording differs from the model answer.",
    "",
    `Question: ${state.questionText}`,
    `Model answer: ${state.correctAnswer}`,
    `Student answer: ${studentAnswer}`,
    "",
    'Return ONLY JSON: {"score": 0.0-1.0, "reasoning": "one sentence on what was right/wrong"}',
  ].join("\n");

  try {
    const text = await safeInvokeLlm(prompt);
    const parsed = safeParseJson(text);

    if (!parsed || typeof parsed.score !== "number") {
      return heuristicGrading(studentAnswer, state.correctAnswer);
    }

    return {
      score: Math.max(0, Math.min(1, parsed.score)),
      reasoning: parsed.reasoning || "",
    };
  } catch {
    // Fallback gracefully if AI service is down or key is missing
    return heuristicGrading(studentAnswer, state.correctAnswer);
  }
}

async function generateFeedbackNode(state) {
  const studentAnswer = (state.studentAnswer || "").trim();
  if (!studentAnswer) {
    return { feedback: `No answer was provided. Model answer: "${state.correctAnswer}".` };
  }

  const prompt = [
    "A student answered a quiz question incorrectly or incompletely. Write 2-3",
    "sentences of encouraging, specific feedback: what they got right (if anything),",
    "what was missing, and the correct idea — grounded in the lecture excerpt below.",
    "Do not just restate the model answer verbatim; explain it.",
    "",
    `Question: ${state.questionText}`,
    `Model answer: ${state.correctAnswer}`,
    `Student answer: ${studentAnswer}`,
    `Why it's marked this way: ${state.reasoning}`,
    `Lecture excerpt for context: ${state.sourceExcerpt || "(not available)"}`,
  ].join("\n");

  try {
    const text = await safeInvokeLlm(prompt);
    return { feedback: text.trim() };
  } catch {
    return {
      feedback: `The answer did not sufficiently match the model answer. Correct answer idea: "${state.correctAnswer}".`,
    };
  }
}

// ---- routing ---------------------------------------------------------------

function routeAfterGrading(state) {
  return state.score >= PASS_THRESHOLD ? "end" : "generate_feedback";
}

// ---- graph assembly ---------------------------------------------------------

const graph = new StateGraph(GradingState)
  .addNode("grade_answer", gradeAnswerNode)
  .addNode("generate_feedback", generateFeedbackNode)
  .addEdge(START, "grade_answer")
  .addConditionalEdges("grade_answer", routeAfterGrading, {
    end: END,
    generate_feedback: "generate_feedback",
  })
  .addEdge("generate_feedback", END);

export const gradingGraphApp = graph.compile();

export async function gradeShortAnswer({ questionText, correctAnswer, studentAnswer, sourceExcerpt }) {
  try {
    const result = await gradingGraphApp.invoke({
      questionText,
      correctAnswer,
      studentAnswer,
      sourceExcerpt,
    });

    return {
      score: typeof result.score === "number" ? result.score : 0,
      feedback:
        result.feedback ||
        (result.score >= PASS_THRESHOLD ? "Correct — nice work." : result.reasoning || "Needs review."),
    };
  } catch {
    const fallback = heuristicGrading(studentAnswer, correctAnswer);
    return {
      score: fallback.score,
      feedback: fallback.reasoning,
    };
  }
}
