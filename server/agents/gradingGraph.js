import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0,
});

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
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

// ---- nodes ---------------------------------------------------------------

async function gradeAnswerNode(state) {
  const prompt = [
    "Grade a student's short-answer response semantically — reward correct",
    "understanding even if the wording differs from the model answer.",
    "",
    `Question: ${state.questionText}`,
    `Model answer: ${state.correctAnswer}`,
    `Student answer: ${state.studentAnswer || "(no answer given)"}`,
    "",
    'Return ONLY JSON: {"score": 0.0-1.0, "reasoning": "one sentence on what was right/wrong"}',
  ].join("\n");

  const res = await llm.invoke(prompt);
  const parsed = safeParseJson(res.content.toString());

  if (!parsed || typeof parsed.score !== "number") {
    // fail closed to "needs feedback" rather than silently awarding credit
    return { score: 0, reasoning: "Could not automatically grade this answer." };
  }

  return {
    score: Math.max(0, Math.min(1, parsed.score)),
    reasoning: parsed.reasoning || "",
  };
}

async function generateFeedbackNode(state) {
  const prompt = [
    "A student answered a quiz question incorrectly or incompletely. Write 2-3",
    "sentences of encouraging, specific feedback: what they got right (if anything),",
    "what was missing, and the correct idea — grounded in the lecture excerpt below.",
    "Do not just restate the model answer verbatim; explain it.",
    "",
    `Question: ${state.questionText}`,
    `Model answer: ${state.correctAnswer}`,
    `Student answer: ${state.studentAnswer || "(no answer given)"}`,
    `Why it's marked this way: ${state.reasoning}`,
    `Lecture excerpt for context: ${state.sourceExcerpt || "(not available)"}`,
  ].join("\n");

  const res = await llm.invoke(prompt);
  return { feedback: res.content.toString().trim() };
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
  const result = await gradingGraphApp.invoke({
    questionText,
    correctAnswer,
    studentAnswer,
    sourceExcerpt,
  });

  return {
    score: result.score,
    feedback:
      result.feedback ||
      (result.score >= PASS_THRESHOLD ? "Correct — nice work." : result.reasoning),
  };
}
