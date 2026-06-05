import { Link } from 'react-router-dom';
import { Button, Card, cn } from '@codecraft/ui';

import type { ContinueLessonView } from './useContinueLesson.js';

type ContinueLearningProps = {
  continueLesson: ContinueLessonView;
  /** `hero` = primary CTA on landing; `banner` = card on lessons index. */
  variant: 'hero' | 'banner';
  className?: string;
};

/**
 * Surfaces the student's in-progress lesson + stage with a deep link.
 */
export function ContinueLearning({ continueLesson, variant, className }: ContinueLearningProps) {
  const { href, lessonTitle, stageLabel } = continueLesson;

  if (variant === 'hero') {
    return (
      <Link to={href} className={className}>
        <Button size="lg" className="w-full sm:w-auto">
          Continue: {lessonTitle} → {stageLabel}
        </Button>
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className={cn('block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus-ring)] rounded-2xl', className)}
    >
      <Card className="border-[var(--cc-primary)] bg-[var(--cc-surface)] p-4 shadow-md transition-shadow hover:shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cc-primary)]">
              Pick up where you left off
            </p>
            <p className="mt-1 text-lg font-bold">{lessonTitle}</p>
            <p className="text-sm text-[var(--cc-fg-muted)]">
              Next up: <span className="font-medium text-[var(--cc-fg)]">{stageLabel}</span>
            </p>
          </div>
          <Button variant="primary" size="sm" className="pointer-events-none">
            Continue →
          </Button>
        </div>
      </Card>
    </Link>
  );
}
