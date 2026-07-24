import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { retrieveRelevantChunks } from "../services/transcriptService.js";

const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY,
  model: "gemini-2.0-flash",
  temperature: 0,
});

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
  if (state.documents.length === 0) {
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

  const res = await llm.invoke(prompt);
  const verdict = res.content.toString().trim().toLowerCase().includes("yes")
    ? "yes"
    : "no";

  return { relevanceVerdict: verdict };
}

async function transformQueryNode(state) {
  const prompt = [
    `This search query returned poor results against lecture transcripts: "${state.question}"`,
    "Rewrite it into a clearer, more specific query using terminology a lecturer",
    "would actually say out loud. Return ONLY the rewritten query, nothing else.",
  ].join("\n");

  const res = await llm.invoke(prompt);

  return {
    question: res.content.toString().trim(),
    retryCount: state.retryCount + 1,
  };
}

async function generateNode(state) {
  if (state.documents.length === 0) {
    return {
      generation:
        "I couldn't find anything in this course's lectures that answers that. " +
        "Try rephrasing, or it may not be covered in this course.",
    };
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

  const res = await llm.invoke(prompt);
  return { generation: res.content.toString().trim() };
}

// ---- Conditional routing ---------------------------------------------

function routeAfterGrading(state) {
  if (state.relevanceVerdict === "yes") return "generate";
  if (state.retryCount >= MAX_RETRIES) return "generate"; // stop looping, answer honestly
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

  return {
    answer: result.generation,
    sources: [...new Set(result.documents.map((d) => d.lectureTitle))],
    retriesUsed: result.retryCount,
  };
}
