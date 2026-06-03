import { CodeBlock } from '@codecraft/ui';
import { StageScaffold } from './StageScaffold.js';
import type { StageViewProps } from './types.js';

/**
 * Stub view for Stage 1. Real implementation (line-by-line reveal with Framer Motion,
 * synced highlights, narrated explanations) is the `animated_walkthrough` todo.
 */
export function WalkthroughStageView({ lesson, onAdvance, onBack }: StageViewProps) {
  const wt = lesson.stages.walkthrough;
  return (
    <StageScaffold
      title="Watch the code in action"
      description="A step-by-step walkthrough of the snippet (animated version coming in the next todo)."
      onBack={onBack}
      onPrimary={() => onAdvance({ status: 'completed' })}
    >
      <CodeBlock code={wt.code} language={wt.language} />
      <div className="mt-2 space-y-3">
        <p className="text-sm font-semibold text-[var(--cc-fg-muted)]">Steps:</p>
        <ol className="ml-5 list-decimal space-y-2 text-sm">
          {wt.steps.map((step) => (
            <li key={step.id}>
              <span className="font-medium">Line {step.revealUpToLine}:</span> {step.explanation}
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-2 rounded-lg border border-[var(--cc-border)] bg-[var(--cc-surface-hover)] p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-fg-muted)]">
          Where you will see this in the wild
        </p>
        <p className="mt-1 text-sm">{wt.realWorldSnippet.caption}</p>
        <CodeBlock code={wt.realWorldSnippet.code} className="mt-2" />
      </div>
    </StageScaffold>
  );
}
