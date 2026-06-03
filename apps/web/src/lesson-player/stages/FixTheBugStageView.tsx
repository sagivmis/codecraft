import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CodeBlock, cn } from '@codecraft/ui';

import { CodeKeyboard } from '../code-keyboard/CodeKeyboard.js';
import type { EditorAdapter } from '../code-keyboard/types.js';
import { LazyMonacoEditor } from '../editor/LazyMonacoEditor.js';
import { HintTree } from '../fix-the-bug/HintTree.js';
import { LineReorder, shuffle } from '../fix-the-bug/LineReorder.js';
import { checkSolution, type CheckResult } from '../fix-the-bug/checker.js';
import type { StageViewProps } from './types.js';

type Outcome =
  | { kind: 'idle' }
  | { kind: 'pass'; feedback?: string }
  | { kind: 'fail'; reason: string };

export function FixTheBugStageView({ lesson, progress, onAdvance, onBack }: StageViewProps) {
  const fb = lesson.stages.fixTheBug;

  if (fb.mode === 'reorder') {
    return (
      <ReorderModeView
        lesson={lesson}
        onAdvance={onAdvance}
        onBack={onBack}
        previouslyCompleted={progress.status === 'completed'}
      />
    );
  }

  return (
    <EditModeView
      lesson={lesson}
      onAdvance={onAdvance}
      onBack={onBack}
      previouslyCompleted={progress.status === 'completed'}
    />
  );
}

/* ============================================================ */
/* Edit mode: textarea + Code Keyboard + deterministic checker. */
/* ============================================================ */

function EditModeView({
  lesson,
  onAdvance,
  onBack,
  previouslyCompleted,
}: {
  lesson: StageViewProps['lesson'];
  onAdvance: StageViewProps['onAdvance'];
  onBack: StageViewProps['onBack'];
  previouslyCompleted: boolean;
}) {
  const fb = lesson.stages.fixTheBug;
  const [code, setCode] = useState(fb.buggyCode);
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'idle' });
  const [attempts, setAttempts] = useState(0);
  const [adapter, setAdapter] = useState<EditorAdapter | null>(null);

  const handleCheck = useCallback(() => {
    const result: CheckResult = checkSolution(code, fb);
    setAttempts((a) => a + 1);
    setOutcome(result.kind === 'pass' ? { kind: 'pass', feedback: result.feedback } : result);
  }, [code, fb]);

  const handleReset = useCallback(() => {
    setCode(fb.buggyCode);
    setOutcome({ kind: 'idle' });
  }, [fb.buggyCode]);

  const passed = outcome.kind === 'pass' || previouslyCompleted;

  return (
    <Card className="flex flex-col gap-5">
      <Header
        title="Spot the bug"
        subtitle="Read carefully - the snippet looks right but does the wrong thing. Edit until the bug is gone."
      />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-[var(--cc-danger)]">Buggy code:</p>
        <div
          className={cn(
            'rounded-xl ring-1 ring-transparent transition-shadow',
            outcome.kind === 'pass' && 'ring-[var(--cc-success)]',
            outcome.kind === 'fail' && 'ring-[var(--cc-danger)]',
          )}
        >
          <LazyMonacoEditor
            value={code}
            onChange={setCode}
            language={fb.language}
            onAdapter={setAdapter}
            heightLines={Math.max(5, code.split('\n').length + 1)}
          />
        </div>
        {adapter && (
          <CodeKeyboard
            language={fb.language}
            adapter={adapter}
            lessonPalette={lesson.codeKeyboard?.lessonPalette}
            disableBaseTokens={lesson.codeKeyboard?.disableBaseTokens}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" size="md" onClick={handleCheck}>
          Check my fix
        </Button>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          Reset
        </Button>
        {attempts > 0 && (
          <span className="text-xs text-[var(--cc-fg-muted)]">
            Attempt {attempts}
          </span>
        )}
      </div>

      <OutcomeBanner outcome={outcome} postSuccess={fb.postSuccessExplanation} />

      {!passed && <HintTree hints={fb.hints} />}

      {passed && (
        <details className="rounded-md border border-[var(--cc-border)] bg-[var(--cc-surface)] p-3">
          <summary className="cursor-pointer text-sm font-medium">Show canonical solution</summary>
          <CodeBlock code={fb.solutionCode} className="mt-2" />
        </details>
      )}

      <NavigationBar
        canContinue={passed}
        attempted={attempts > 0}
        onBack={onBack}
        onSkip={() => onAdvance({ status: 'attempted', meta: { attempts } })}
        onContinue={() => onAdvance({ status: 'completed', meta: { attempts } })}
      />
    </Card>
  );
}

/* ============================================================ */
/* Reorder mode: drag lines into the correct order.             */
/* ============================================================ */

function ReorderModeView({
  lesson,
  onAdvance,
  onBack,
  previouslyCompleted,
}: {
  lesson: StageViewProps['lesson'];
  onAdvance: StageViewProps['onAdvance'];
  onBack: StageViewProps['onBack'];
  previouslyCompleted: boolean;
}) {
  const fb = lesson.stages.fixTheBug;
  const targetLines = useMemo(() => fb.solutionCode.split('\n'), [fb.solutionCode]);
  const initialOrder = useMemo(() => shuffle(targetLines, 7), [targetLines]);
  const [order, setOrder] = useState<string[]>(initialOrder);
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'idle' });
  const [attempts, setAttempts] = useState(0);

  const handleCheck = useCallback(() => {
    setAttempts((a) => a + 1);
    const result = checkSolution(order.join('\n'), fb);
    setOutcome(result.kind === 'pass' ? { kind: 'pass', feedback: result.feedback } : result);
  }, [order, fb]);

  const handleReset = useCallback(() => {
    setOrder(initialOrder);
    setOutcome({ kind: 'idle' });
  }, [initialOrder]);

  const passed = outcome.kind === 'pass' || previouslyCompleted;

  return (
    <Card className="flex flex-col gap-5">
      <Header
        title="Put the lines in order"
        subtitle="The right lines are here - in the wrong order. Drag them so the code makes sense top-to-bottom."
      />

      <LineReorder initialLines={initialOrder} onChange={setOrder} language={fb.language} />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" size="md" onClick={handleCheck}>
          Check order
        </Button>
        <Button variant="secondary" size="sm" onClick={handleReset}>
          Re-shuffle
        </Button>
        {attempts > 0 && (
          <span className="text-xs text-[var(--cc-fg-muted)]">Attempt {attempts}</span>
        )}
      </div>

      <OutcomeBanner outcome={outcome} postSuccess={fb.postSuccessExplanation} />

      {!passed && <HintTree hints={fb.hints} />}

      <NavigationBar
        canContinue={passed}
        attempted={attempts > 0}
        onBack={onBack}
        onSkip={() => onAdvance({ status: 'attempted', meta: { attempts } })}
        onContinue={() => onAdvance({ status: 'completed', meta: { attempts } })}
      />
    </Card>
  );
}

/* ============================================================ */
/* Shared subcomponents.                                        */
/* ============================================================ */

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1 text-[var(--cc-fg-muted)]">{subtitle}</p>
    </div>
  );
}

function OutcomeBanner({ outcome, postSuccess }: { outcome: Outcome; postSuccess: string }) {
  if (outcome.kind === 'idle') return null;
  const passed = outcome.kind === 'pass';
  return (
    <motion.div
      key={outcome.kind}
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="status"
      aria-live="polite"
      className={cn(
        'rounded-lg border p-3 text-sm',
        passed
          ? 'border-[var(--cc-success)] bg-[var(--cc-success)]/10'
          : 'border-[var(--cc-danger)] bg-[var(--cc-danger)]/10',
      )}
    >
      <p className="font-semibold">{passed ? 'Fixed it!' : 'Not yet.'}</p>
      <p className="mt-1">
        {passed
          ? (outcome.kind === 'pass' && outcome.feedback) || postSuccess
          : outcome.kind === 'fail'
            ? outcome.reason
            : ''}
      </p>
    </motion.div>
  );
}

function NavigationBar({
  canContinue,
  attempted,
  onBack,
  onSkip,
  onContinue,
}: {
  canContinue: boolean;
  attempted: boolean;
  onBack: () => void;
  onSkip: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="md" onClick={onBack}>
        Back
      </Button>
      <div className="flex-1" />
      {attempted && !canContinue && (
        <Button variant="secondary" size="md" onClick={onSkip}>
          Skip
        </Button>
      )}
      <Button variant="primary" size="md" disabled={!canContinue} onClick={onContinue}>
        {canContinue ? 'Continue →' : 'Fix it to continue'}
      </Button>
    </div>
  );
}
