import { CodeBlock } from '@codecraft/ui';
import { StageScaffold } from './StageScaffold.js';
import type { StageViewProps } from './types.js';

/**
 * Stub view for Stage 3. Real implementation (Monaco + CodeKeyboard + Web Worker
 * test runner with friendly errors) is the `implement_stage` todo.
 */
export function ImplementStageView({ lesson, onAdvance, onBack }: StageViewProps) {
  const impl = lesson.stages.implement;
  return (
    <StageScaffold
      title="Now you write it"
      description="A coding task with automated tests. Editor + test runner coming next."
      onBack={onBack}
      onPrimary={() => onAdvance({ status: 'completed' })}
      primaryLabel="Mark complete"
    >
      <div className="rounded-md border border-[var(--cc-border)] bg-[var(--cc-surface-hover)] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-fg-muted)]">
          Task
        </p>
        <p className="mt-1 text-sm">{impl.taskDescription}</p>
      </div>
      <p className="mt-2 text-sm font-semibold text-[var(--cc-fg-muted)]">Starter:</p>
      <CodeBlock code={impl.starterCode || '// (empty)'} language={impl.language} />
      <p className="mt-2 text-sm font-semibold text-[var(--cc-fg-muted)]">Tests:</p>
      <ul className="ml-5 list-disc space-y-1 text-sm">
        {impl.tests.map((t) => (
          <li key={t.id}>
            <span className="font-medium">{t.description}</span>
            {!t.hidden && (
              <span className="ml-2 font-mono text-xs text-[var(--cc-fg-muted)]">{t.code}</span>
            )}
          </li>
        ))}
      </ul>
    </StageScaffold>
  );
}
