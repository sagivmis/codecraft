import type { ReactNode } from 'react';
import { Button, Card } from '@codecraft/ui';

/**
 * Shared visual scaffold every stage stub renders into. Real stage components
 * will gradually replace these placeholders.
 */
export function StageScaffold({
  title,
  description,
  children,
  primaryLabel = 'Mark complete & continue',
  onPrimary,
  onSkip,
  onBack,
  canGoBack = true,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  primaryLabel?: string;
  onPrimary: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="mt-1 text-[var(--cc-fg-muted)]">{description}</p>
      </div>

      {children}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {canGoBack && onBack && (
          <Button variant="ghost" size="md" onClick={onBack}>
            Back
          </Button>
        )}
        <div className="flex-1" />
        {onSkip && (
          <Button variant="secondary" size="md" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Button variant="primary" size="md" onClick={onPrimary}>
          {primaryLabel}
        </Button>
      </div>
    </Card>
  );
}
