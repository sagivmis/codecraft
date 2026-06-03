import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, cn } from '@codecraft/ui';
import type { WalkthroughStage, WalkthroughStep } from '@codecraft/schema';

import { WALKTHROUGH_AUTOPLAY_MS } from '@types';

type AnimatedSnippetProps = {
  walkthrough: WalkthroughStage;
  /** Default auto-play delay between steps (ms). */
  autoPlayDelayMs?: number;
  /** Called when the student finishes the last step. */
  onComplete?: () => void;
};

/**
 * Stage 1: line-by-line reveal of a code snippet with per-step explanations
 * and synced highlight regions.
 *
 * Two layers stacked over the code:
 *  - reveal layer: a clip-path mask that grows downward as steps advance
 *  - highlight layer: absolute-positioned color rectangles computed from
 *    the active step's HighlightRange(s) using monospace `ch` units.
 *
 * No real syntax highlighting yet - that can be layered in later with Shiki
 * without changing this component's geometry. Monospace is the only hard
 * requirement.
 */
export function AnimatedSnippet({
  walkthrough,
  autoPlayDelayMs = WALKTHROUGH_AUTOPLAY_MS,
  onComplete,
}: AnimatedSnippetProps) {
  const lines = useMemo(() => walkthrough.code.split('\n'), [walkthrough.code]);
  const steps = walkthrough.steps;
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const completedRef = useRef(false);

  const step = steps[stepIdx] ?? steps[0];

  const goToStep = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(steps.length - 1, idx));
      setStepIdx(clamped);
    },
    [steps.length],
  );

  const goPrev = useCallback(() => {
    setIsPlaying(false);
    goToStep(stepIdx - 1);
  }, [goToStep, stepIdx]);

  const goNext = useCallback(() => {
    if (stepIdx >= steps.length - 1) {
      setIsPlaying(false);
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
      return;
    }
    goToStep(stepIdx + 1);
  }, [goToStep, onComplete, stepIdx, steps.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const pause = step?.pauseMs ?? autoPlayDelayMs;
    const id = window.setTimeout(() => {
      if (stepIdx >= steps.length - 1) {
        setIsPlaying(false);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return;
      }
      setStepIdx((s) => Math.min(s + 1, steps.length - 1));
    }, pause);
    return () => window.clearTimeout(id);
  }, [autoPlayDelayMs, isPlaying, onComplete, step, stepIdx, steps.length]);

  useEffect(() => {
    if (stepIdx === steps.length - 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [onComplete, stepIdx, steps.length]);

  const revealUpToLine = step?.revealUpToLine ?? 1;
  const highlights = step?.highlights ?? [];

  return (
    <div className="flex flex-col gap-4">
      <CodeStage lines={lines} revealUpToLine={revealUpToLine} highlights={highlights} />

      <StepNarration step={step} stepIdx={stepIdx} totalSteps={steps.length} />

      <Controls
        stepIdx={stepIdx}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onPrev={goPrev}
        onNext={goNext}
        onTogglePlay={() => setIsPlaying((p) => !p)}
      />
    </div>
  );
}

/* ---------------------------------------------------------------- */

type HighlightLike = NonNullable<WalkthroughStep['highlights']>[number];

function CodeStage({
  lines,
  revealUpToLine,
  highlights,
}: {
  lines: string[];
  revealUpToLine: number;
  highlights: HighlightLike[];
}) {
  const maxCols = useMemo(
    () => lines.reduce((max, line) => Math.max(max, line.length), 1),
    [lines],
  );

  return (
    <div className="relative overflow-x-auto rounded-xl border border-[var(--cc-border)] bg-[var(--cc-code-bg)] p-4 font-mono text-sm leading-[1.6] text-[var(--cc-code-fg)] md:text-base md:leading-[1.7]">
      <pre className="relative m-0 whitespace-pre">
        {/* Highlight layer - rendered first so code sits on top */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {highlights.map((h, i) => (
            <HighlightRect key={`${h.startLine}-${h.endLine}-${i}`} highlight={h} />
          ))}
        </div>

        {/* Code lines with progressive reveal */}
        <code>
          {lines.map((line, idx) => {
            const lineNumber = idx + 1;
            const visible = lineNumber <= revealUpToLine;
            return (
              <motion.div
                key={lineNumber}
                initial={false}
                animate={{
                  opacity: visible ? 1 : 0,
                  y: visible ? 0 : -4,
                  filter: visible ? 'blur(0px)' : 'blur(2px)',
                }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="flex"
                style={{ minHeight: '1.6em' }}
              >
                <span className="select-none pr-4 text-right text-[var(--cc-fg-muted)] opacity-60 tabular-nums w-6">
                  {lineNumber}
                </span>
                <span className="flex-1">{line === '' ? '\u00A0' : line}</span>
              </motion.div>
            );
          })}
        </code>

        {/* Sentinel to enforce minimum width based on widest line */}
        <span className="invisible block whitespace-pre" aria-hidden>
          {' '.repeat(maxCols)}
        </span>
      </pre>
    </div>
  );
}

function HighlightRect({ highlight }: { highlight: HighlightLike }) {
  const { startLine, endLine, startColumn, endColumn } = highlight;

  const top = `calc(${startLine - 1} * 1.6em)`;
  const height = `calc(${endLine - startLine + 1} * 1.6em)`;

  /* The line-number gutter is exactly w-6 (1.5rem). The `pr-4` on the
   * number span is padding INSIDE that 1.5rem, not extra space — code
   * text starts at the 1.5rem mark. Off-by-1rem here is what shifted
   * the highlight ~2 chars to the right of where it should be. */
  const gutter = '1.5rem';
  const left = startColumn !== undefined ? `calc(${gutter} + ${startColumn - 1} * 1ch)` : gutter;
  const width =
    startColumn !== undefined && endColumn !== undefined
      ? `calc(${endColumn - startColumn + 1} * 1ch)`
      : `calc(100% - ${gutter})`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-md ring-1 ring-inset"
      style={{
        position: 'absolute',
        top,
        left,
        height,
        width,
        background: 'var(--cc-code-highlight)',
        boxShadow: '0 0 0 1px var(--cc-code-highlight) inset',
      }}
    />
  );
}

function StepNarration({
  step,
  stepIdx,
  totalSteps,
}: {
  step: WalkthroughStep | undefined;
  stepIdx: number;
  totalSteps: number;
}) {
  return (
    <div className="min-h-[5.5rem] rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cc-fg-muted)]">
        Step {stepIdx + 1} of {totalSteps}
      </p>
      <AnimatePresence mode="wait">
        <motion.p
          key={step?.id ?? stepIdx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="mt-1 text-base leading-relaxed"
        >
          {step?.explanation}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function Controls({
  stepIdx,
  totalSteps,
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
}: {
  stepIdx: number;
  totalSteps: number;
  isPlaying: boolean;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}) {
  const atStart = stepIdx === 0;
  const atEnd = stepIdx === totalSteps - 1;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" size="sm" onClick={onPrev} disabled={atStart}>
        ← Prev
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause auto-play' : 'Start auto-play'}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </Button>
      <div className="flex-1" />
      <ol className="flex items-center gap-1" aria-label="Walkthrough progress">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <li
            key={i}
            className={cn(
              'h-1.5 w-6 rounded-full',
              i <= stepIdx ? 'bg-[var(--cc-primary)]' : 'bg-[var(--cc-surface-hover)]',
            )}
          />
        ))}
      </ol>
      <div className="flex-1" />
      <Button variant="primary" size="sm" onClick={onNext}>
        {atEnd ? 'Finish ✓' : 'Next →'}
      </Button>
    </div>
  );
}
