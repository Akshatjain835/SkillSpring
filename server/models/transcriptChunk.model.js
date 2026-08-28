import mongoose from "mongoose";

const transcriptChunkSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
      index: true,
    },
    lectureTitle: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    chunkText: {
      type: String,
      required: true,
    },
    // Google text-embedding-004 returns 768-dim vectors
    embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

// Speeds up "give me all chunks for this course" retrieval calls
transcriptChunkSchema.index({ courseId: 1, lectureId: 1, chunkIndex: 1 });

export const TranscriptChunk = mongoose.model(
  "TranscriptChunk",
  transcriptChunkSchema
);
