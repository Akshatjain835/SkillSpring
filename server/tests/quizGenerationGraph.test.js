import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFallbackQuestions, isQuotaError } from '../agents/quizGenerationGraph.js';

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
    assert.match(question.sourceExcerpt.toLowerCase(), /machine|training|validation|model|data|evaluate|generalize/);
  });
});

test('isQuotaError recognizes Gemini 429 quota failures', () => {
  const error = new Error('429 Too Many Requests: quota exceeded');
  assert.equal(isQuotaError(error), true);
});
