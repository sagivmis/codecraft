import { CodeBlock } from '@codecraft/ui';
import { StageScaffold } from './StageScaffold.js';
import type { StageViewProps } from './types.js';

/**
 * Stub view for Stage 2. Real implementation (Monaco editor, deterministic checker,
 * hint tree, autocomplete from the code-keyboard palette) is the `fix_the_bug` todo.
 */
export function FixTheBugStageView({ lesson, onAdvance, onBack }: StageViewProps) {
  const fb = lesson.stages.fixTheBug;
  return (
    <StageScaffold
      title="Spot the bug"
      description="Find what is wrong and fix it. The interactive editor + checker arrives in a later todo."
      onBack={onBack}
      onSkip={() => onAdvance({ status: 'attempted' })}
      onPrimary={() => onAdvance({ status: 'completed' })}
    >
      <p className="text-sm font-semibold text-[var(--cc-danger)]">Buggy code:</p>
      <CodeBlock code={fb.buggyCode} language={fb.language} />
      <details className="rounded-md border border-[var(--cc-border)] bg-[var(--cc-surface-hover)] p-3">
        <summary className="cursor-pointer text-sm font-medium">Show solution</summary>
        <CodeBlock code={fb.solutionCode} language={fb.language} className="mt-2" />
        <p className="mt-2 text-sm text-[var(--cc-fg-muted)]">{fb.postSuccessExplanation}</p>
      </details>
    </StageScaffold>
  );
}
