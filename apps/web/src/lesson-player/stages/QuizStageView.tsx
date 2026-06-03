import { StageScaffold } from './StageScaffold.js';
import type { StageViewProps } from './types.js';

/**
 * Stub view for the mini-quiz. Real implementation (interactive multiple-choice,
 * what-prints input, instant feedback) lands in the `quiz_component` todo.
 */
export function QuizStageView({ lesson, onAdvance, onBack }: StageViewProps) {
  const quiz = lesson.stages.quiz;
  return (
    <StageScaffold
      title="Quick check"
      description="Three short questions to make sure that stuck. Interactive version coming next."
      onBack={onBack}
      onPrimary={() => onAdvance({ status: 'completed' })}
    >
      <ol className="ml-5 list-decimal space-y-3 text-sm">
        {quiz.questions.map((q) => (
          <li key={q.id}>
            <p className="font-medium">{q.prompt}</p>
            {q.kind === 'multipleChoice' ? (
              <ul className="mt-1 ml-4 list-disc text-[var(--cc-fg-muted)]">
                {q.options.map((opt) => (
                  <li key={opt.id}>{opt.label}</li>
                ))}
              </ul>
            ) : (
              <pre className="mt-1 rounded-md bg-[var(--cc-code-bg)] p-2 font-mono text-xs text-[var(--cc-code-fg)]">
                {q.code}
              </pre>
            )}
          </li>
        ))}
      </ol>
    </StageScaffold>
  );
}
