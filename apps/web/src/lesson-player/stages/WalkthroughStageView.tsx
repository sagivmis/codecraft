import { useState } from 'react';
import { Button, Card, CodeBlock } from '@codecraft/ui';
import { AnimatedSnippet } from '../animated-snippet/AnimatedSnippet.js';
import type { StageViewProps } from './types.js';

export function WalkthroughStageView({ lesson, progress, onAdvance, onBack }: StageViewProps) {
  const wt = lesson.stages.walkthrough;
  /* If the student already completed this stage once, let them continue
   * without forcing a full re-watch. */
  const alreadyCompleted = progress.status === 'completed';
  const [walkthroughDone, setWalkthroughDone] = useState(alreadyCompleted);

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Watch the code in action</h2>
        <p className="mt-1 text-[var(--cc-fg-muted)]">
          Step through the snippet line by line. Tap Play to auto-advance, or use Next / Prev.
        </p>
      </div>

      <AnimatedSnippet walkthrough={wt} onComplete={() => setWalkthroughDone(true)} />

      {walkthroughDone && (
        <div className="rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface-hover)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cc-fg-muted)]">
            Where you'll see this in the wild
          </p>
          <p className="mt-1 text-sm">{wt.realWorldSnippet.caption}</p>
          <CodeBlock code={wt.realWorldSnippet.code} className="mt-3" />
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
          disabled={!walkthroughDone}
          onClick={() => onAdvance({ status: 'completed' })}
        >
          Continue to the quiz →
        </Button>
      </div>
    </Card>
  );
}
