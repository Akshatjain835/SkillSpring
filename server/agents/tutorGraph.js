import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { retrieveRelevantChunks } from "../services/transcriptService.js";

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

const MAX_RETRIES = 2;

/**
 * Graph state. Annotation.Root gives each field a reducer; the default
 * reducer just overwrites with the node's return value, which is what
 * we want for everything here.
 */
const TutorState = Annotation.Root({
  courseId: Annotation(),
  originalQuestion: Annotation(),
  question: Annotation(), // mutated by transform_query on retries
  documents: Annotation({ default: () => [] }),
  relevanceVerdict: Annotation({ default: () => "no" }),
  retryCount: Annotation({ default: () => 0 }),
  generation: Annotation(),
});

// ---- Nodes -----------------------------------------------------------

async function retrieveNode(state) {
  const documents = await retrieveRelevantChunks({
    courseId: state.courseId,
    query: state.question,
    k: 5,
  });
  return { documents };
}

async function gradeDocumentsNode(state) {
  if (!state.documents || state.documents.length === 0) {
    return { relevanceVerdict: "no" };
  }

  const context = state.documents
    .map((d) => d.chunkText)
    .join("\n---\n")
    .slice(0, 6000); // keep the grading prompt cheap

  const prompt = [
    "You are grading whether retrieved lecture excerpts are relevant enough",
    "to answer a student's question.",
    "",
    `Question: ${state.question}`,
    "",
    "Retrieved excerpts:",
    context,
    "",
    'Reply with exactly one word: "yes" if at least some excerpts genuinely',
    'help answer the question, or "no" if none of them do.',
  ].join("\n");

  try {
    const text = await safeInvokeLlm(prompt);
    const verdict = text.trim().toLowerCase().includes("yes") ? "yes" : "no";
    return { relevanceVerdict: verdict };
  } catch {
    // If grading fails due to missing key / API error, allow generation to proceed if documents exist
    return { relevanceVerdict: state.documents.length > 0 ? "yes" : "no" };
  }
}

async function transformQueryNode(state) {
  const currentRetry = Number.isInteger(state.retryCount) ? state.retryCount : 0;
  const prompt = [
    `This search query returned poor results against lecture transcripts: "${state.question}"`,
    "Rewrite it into a clearer, more specific query using terminology a lecturer",
    "would actually say out loud. Return ONLY the rewritten query, nothing else.",
  ].join("\n");

  try {
    const text = await safeInvokeLlm(prompt);
    return {
      question: text.trim() || state.question,
      retryCount: currentRetry + 1,
    };
  } catch {
    return {
      question: state.question,
      retryCount: currentRetry + 1,
    };
  }
}

async function generateNode(state) {
  const fallbackAnswer =
    "I couldn't find anything in this course's lectures that answers that. " +
    "Try rephrasing, or it may not be covered in this course.";

  if (!state.documents || state.documents.length === 0 || state.relevanceVerdict === "no") {
    return { generation: fallbackAnswer };
  }

  const context = state.documents
    .map((d, i) => `[Excerpt ${i + 1} — from "${d.lectureTitle}"]\n${d.chunkText}`)
    .join("\n\n");

  const prompt = [
    "You are an AI tutor for this specific course. Answer the student's question",
    "using ONLY the lecture excerpts below — do not use outside knowledge.",
    "Cite which lecture(s) you drew from by name. If the excerpts only partially",
    "answer the question, say so honestly instead of filling gaps with a guess.",
    "",
    "Lecture excerpts:",
    context,
    "",
    `Student question: ${state.originalQuestion}`,
    "",
    "Answer:",
  ].join("\n");

  try {
    const text = await safeInvokeLlm(prompt);
    return { generation: text.trim() || fallbackAnswer };
  } catch {
    return { generation: fallbackAnswer };
  }
}

// ---- Conditional routing ---------------------------------------------

function routeAfterGrading(state) {
  const retries = Number.isInteger(state.retryCount) ? state.retryCount : 0;
  if (state.relevanceVerdict === "yes") return "generate";
  if (retries >= MAX_RETRIES) return "generate"; // stop looping, answer honestly
  return "transform_query";
}

// ---- Graph assembly ----------------------------------------------------

const graph = new StateGraph(TutorState)
  .addNode("retrieve", retrieveNode)
  .addNode("grade_documents", gradeDocumentsNode)
  .addNode("transform_query", transformQueryNode)
  .addNode("generate", generateNode)
  .addEdge(START, "retrieve")
  .addEdge("retrieve", "grade_documents")
  .addConditionalEdges("grade_documents", routeAfterGrading, {
    generate: "generate",
    transform_query: "transform_query",
  })
  .addEdge("transform_query", "retrieve")
  .addEdge("generate", END);

export const tutorGraphApp = graph.compile();

/**
 * Public entrypoint used by the controller.
 */
export async function askTutor({ courseId, question }) {
  const result = await tutorGraphApp.invoke({
    courseId,
    question,
    originalQuestion: question,
  });

  const hasRelevantDocs = result.relevanceVerdict === "yes" && result.documents && result.documents.length > 0;
  const sources = hasRelevantDocs
    ? [...new Set(result.documents.map((d) => d?.lectureTitle).filter(Boolean))]
    : [];

  return {
    answer: result.generation,
    sources,
    retriesUsed: result.retryCount || 0,
  };
}
