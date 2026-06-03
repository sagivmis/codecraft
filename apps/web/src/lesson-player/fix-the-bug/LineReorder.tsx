import { useCallback, useEffect, useState } from 'react';
import { Reorder } from 'framer-motion';
import { cn } from '@codecraft/ui';

type LineReorderProps = {
  /** Initial line order (typically the shuffled buggy code split into lines). */
  initialLines: string[];
  onChange: (lines: string[]) => void;
  language?: string;
};

type Line = { id: string; text: string };

/**
 * Drag-to-reorder list for stage 2 "reorder" mode.
 *
 * Uses framer-motion's <Reorder.Group>. Works on touch (long-press to grab)
 * and on desktop (mouse drag). Each row is keyed by a stable id so React
 * does not mistake reorder for delete-and-insert.
 */
export function LineReorder({ initialLines, onChange, language }: LineReorderProps) {
  const [lines, setLines] = useState<Line[]>(() =>
    initialLines.map((text, idx) => ({ id: `line-${idx}-${text.slice(0, 12)}`, text })),
  );

  /* If the parent regenerates initial lines (e.g. on reset), sync. */
  useEffect(() => {
    setLines(initialLines.map((text, idx) => ({ id: `line-${idx}-${text.slice(0, 12)}`, text })));
  }, [initialLines]);

  const handleReorder = useCallback(
    (next: Line[]) => {
      setLines(next);
      onChange(next.map((l) => l.text));
    },
    [onChange],
  );

  return (
    <Reorder.Group
      axis="y"
      values={lines}
      onReorder={handleReorder}
      className="flex flex-col gap-1 rounded-xl border border-[var(--cc-border)] bg-[var(--cc-code-bg)] p-2"
      data-language={language}
    >
      {lines.map((line, idx) => (
        <Reorder.Item
          key={line.id}
          value={line}
          className={cn(
            'flex cursor-grab items-center gap-3 rounded-md bg-[var(--cc-surface)] px-3 py-2',
            'font-mono text-sm shadow-sm transition-shadow',
            'active:cursor-grabbing active:shadow-md',
          )}
          whileDrag={{ scale: 1.02, zIndex: 50 }}
        >
          <span
            aria-hidden
            className="select-none text-[var(--cc-fg-muted)]"
            style={{ width: '1.5rem' }}
          >
            {idx + 1}
          </span>
          <span aria-hidden className="select-none text-[var(--cc-fg-muted)]">
            ⋮⋮
          </span>
          <code className="flex-1 whitespace-pre">{line.text === '' ? '\u00A0' : line.text}</code>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}

/** Deterministically shuffle an array so the buggy starting order is stable per session. */
export function shuffle<T>(input: T[], seed = 1): T[] {
  const out = [...input];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    const a = out[i];
    const b = out[j];
    if (a === undefined || b === undefined) continue;
    out[i] = b;
    out[j] = a;
  }
  return out;
}
