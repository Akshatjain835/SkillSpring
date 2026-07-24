import { TranscriptChunk } from "../models/transcriptChunk.model.js";

export async function generateAndStoreTranscript({ courseId, lectureId, lectureTitle, videoUrl }) {
  // Placeholder transcript service: if no real transcription provider is configured,
  // store a basic transcript chunk so the tutor and quiz generator can run.
  const chunkText = `Transcript processing is not configured yet. Source video URL: ${videoUrl}`;

  await TranscriptChunk.deleteMany({ lectureId });

  const chunk = await TranscriptChunk.create({
    courseId,
    lectureId,
    lectureTitle,
    chunkIndex: 0,
    chunkText,
  });

  return {
    chunkCount: chunk ? 1 : 0,
    lectureId,
    courseId,
  };
}

export async function retrieveRelevantChunks({ courseId, query = "", k = 5 }) {
  const chunks = await TranscriptChunk.find({ courseId })
    .sort({ chunkIndex: 1 })
    .limit(k)
    .lean();

  if (!query || query.trim().length === 0) {
    return chunks;
  }

  const terms = query.toLowerCase().split(/\W+/).filter(Boolean);

  const ranked = chunks
    .map((chunk) => {
      const text = chunk.chunkText.toLowerCase();
      const score = terms.reduce(
        (sum, term) => sum + (text.includes(term) ? 1 : 0),
        0
      );
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score);

  const result = ranked.filter((item) => item.score > 0).slice(0, k).map((item) => item.chunk);

  return result.length > 0 ? result : chunks;
}
