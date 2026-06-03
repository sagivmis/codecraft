import { useState } from 'react';
import { Button, Card } from '@codecraft/ui';
import { Quiz } from '../quiz/Quiz.js';
import type { StageViewProps } from './types.js';

export function QuizStageView({ lesson, progress, onAdvance, onBack }: StageViewProps) {
  const quiz = lesson.stages.quiz;
  const previouslyCompleted = progress.status === 'completed';

  const [result, setResult] = useState<{ correct: number; total: number } | null>(
    previouslyCompleted ? { correct: quiz.questions.length, total: quiz.questions.length } : null,
  );

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quick check</h2>
        <p className="mt-1 text-[var(--cc-fg-muted)]">
          A couple of questions to make sure that stuck.
        </p>
      </div>

      <Quiz quiz={quiz} onComplete={setResult} />

      {result && (
        <div className="rounded-lg border border-[var(--cc-border)] bg-[var(--cc-surface-hover)] p-3 text-sm">
          You got <span className="font-bold">{result.correct}</span> of{' '}
          <span className="font-bold">{result.total}</span>.{' '}
          {result.correct === result.total
            ? 'Perfect score - on to the next stage.'
            : 'You can re-do the quiz, or carry on. Mistakes are part of learning.'}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="md" onClick={onBack}>
          Back
        </Button>
        <div className="flex-1" />
        <Button
          variant="primary"
          size="md"
          disabled={!result}
          onClick={() =>
            onAdvance({
              status: 'completed',
              meta: result ? { score: result.correct, total: result.total } : undefined,
            })
          }
        >
          Continue →
        </Button>
      </div>
    </Card>
  );
}
