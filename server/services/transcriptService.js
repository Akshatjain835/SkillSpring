import mongoose from "mongoose";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TranscriptChunk } from "../models/transcriptChunk.model.js";

function getEmbeddingsModel() {
  const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAIEmbeddings({
    apiKey,
    modelName: "text-embedding-004",
  });
}

export async function generateEmbedding(text) {
  const model = getEmbeddingsModel();
  if (!model || !text || !text.trim()) return [];
  try {
    const vectors = await model.embedDocuments([text]);
    return Array.isArray(vectors?.[0]) ? vectors[0] : [];
  } catch {
    return [];
  }
}

export function cosineSimilarity(vecA = [], vecB = []) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i += 1) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function generateAndStoreTranscript({ courseId, lectureId, lectureTitle, videoUrl }) {
  // Placeholder transcript service: if no real transcription provider is configured,
  // store a basic transcript chunk so the tutor and quiz generator can run.
  const chunkText = `Transcript processing is not configured yet. Source video URL: ${videoUrl}`;

  await TranscriptChunk.deleteMany({ lectureId });

  const embedding = await generateEmbedding(chunkText);

  const chunk = await TranscriptChunk.create({
    courseId,
    lectureId,
    lectureTitle,
    chunkIndex: 0,
    chunkText,
    embedding,
  });

  return {
    chunkCount: chunk ? 1 : 0,
    lectureId,
    courseId,
    hasVectorEmbedding: embedding.length > 0,
  };
}

export async function retrieveRelevantChunks({ courseId, query = "", k = 5 }) {
  if (mongoose.connection.readyState === 0) {
    return [];
  }

  const chunks = await TranscriptChunk.find({ courseId })
    .sort({ chunkIndex: 1 })
    .lean();

  if (!query || query.trim().length === 0) {
    return chunks.slice(0, k);
  }

  const terms = query.toLowerCase().split(/\W+/).filter(Boolean);
  const queryVector = await generateEmbedding(query);

  const ranked = chunks
    .map((chunk) => {
      const text = chunk.chunkText.toLowerCase();
      const keywordHits = terms.reduce(
        (sum, term) => sum + (text.includes(term) ? 1 : 0),
        0
      );
      const keywordScore = terms.length > 0 ? keywordHits / terms.length : 0;

      let cosineSim = 0;
      if (queryVector.length > 0 && Array.isArray(chunk.embedding) && chunk.embedding.length > 0) {
        cosineSim = cosineSimilarity(queryVector, chunk.embedding);
      }

      // Hybrid score combining vector semantic similarity (70%) and keyword similarity (30%)
      const score = queryVector.length > 0 && chunk.embedding?.length > 0
        ? (0.7 * cosineSim) + (0.3 * keywordScore)
        : keywordScore;

      return { chunk, score, cosineSim, keywordHits };
    })
    .sort((a, b) => b.score - a.score);

  const result = ranked.filter((item) => item.score > 0).slice(0, k).map((item) => item.chunk);

  return result.length > 0 ? result : chunks.slice(0, k);
}
