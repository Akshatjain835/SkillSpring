import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFallbackQuestions, isQuotaError, safeParseJsonArray } from '../agents/quizGenerationGraph.js';
import { cosineSimilarity, retrieveRelevantChunks } from '../services/transcriptService.js';
import { gradeShortAnswer } from '../agents/gradingGraph.js';
import { askTutor } from '../agents/tutorGraph.js';

test('cosineSimilarity calculates exact vector similarity scores', () => {
  const vec1 = [1, 0, 0];
  const vec2 = [1, 0, 0];
  const vec3 = [0, 1, 0];

  assert.equal(cosineSimilarity(vec1, vec2), 1.0);
  assert.equal(cosineSimilarity(vec1, vec3), 0.0);
  assert.equal(cosineSimilarity([], []), 0.0);
});

test('buildFallbackQuestions creates grounded quiz content from transcript', () => {
  const transcript = [
    'Machine learning models learn patterns from data.',
    'Training requires large datasets and careful evaluation.',
    'Validation helps measure whether the model generalizes well.'
  ].join('\n');

  const questions = buildFallbackQuestions({
    lectureTitle: 'Intro to ML',
    transcriptContext: transcript,
    numQuestions: 3,
  });

  assert.equal(questions.length, 3);
  questions.forEach((question) => {
    assert.ok(question.questionText);
    assert.ok(question.correctAnswer);
    assert.ok(question.sourceExcerpt);
    assert.equal(Array.isArray(question.options), true);
  });
});

test('safeParseJsonArray handles raw string, markdown fences, and JSON objects', () => {
  const rawJson = '```json\n[{"questionText": "What is AI?", "type": "mcq", "options": ["A", "B"], "correctAnswer": "A"}]\n```';
  const result = safeParseJsonArray(rawJson);

  assert.ok(result);
  assert.equal(result.length, 1);
  assert.equal(result[0].questionText, 'What is AI?');
  assert.equal(result[0].type, 'mcq');
  assert.deepEqual(result[0].options, ['A', 'B']);
});

test('isQuotaError recognizes 429 quota and rate limit messages', () => {
  assert.equal(isQuotaError(new Error('429 Too Many Requests: quota exceeded')), true);
  assert.equal(isQuotaError(new Error('Rate limit hit')), true);
  assert.equal(isQuotaError(new Error('Normal error')), false);
});

test('gradeShortAnswer provides fallback response without throwing error when API key is missing', async () => {
  const result = await gradeShortAnswer({
    questionText: 'What is overfitting?',
    correctAnswer: 'Overfitting occurs when a model performs well on training data but poorly on test data.',
    studentAnswer: 'It happens when a model learns training data details too well and fails on test data.',
    sourceExcerpt: 'Overfitting happens when a model fits training noise.',
  });

  assert.ok(typeof result.score === 'number');
  assert.ok(result.score >= 0 && result.score <= 1);
  assert.ok(result.feedback);
});

test('askTutor returns friendly message when no API key or empty transcript exists', async () => {
  const result = await askTutor({
    courseId: '000000000000000000000000',
    question: 'What is deep learning?',
  });

  assert.ok(result.answer);
  assert.deepEqual(result.sources, []);
});
