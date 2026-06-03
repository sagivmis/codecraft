import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, CodeBlock, cn } from '@codecraft/ui';
import { runTests, type TestRunResult } from '@codecraft/runtime';
import { CodeKeyboard } from '../code-keyboard/CodeKeyboard.js';
import type { EditorAdapter } from '../code-keyboard/types.js';
import { LazyMonacoEditor } from '../editor/LazyMonacoEditor.js';
import { StageScaffold } from './StageScaffold.js';
import type { StageViewProps } from './types.js';

export function ImplementStageView({ lesson, onAdvance, onBack }: StageViewProps) {
  const impl = lesson.stages.implement;

  const [code, setCode] = useState(impl.starterCode || impl.solutionCode);
  const [result, setResult] = useState<TestRunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [adapter, setAdapter] = useState<EditorAdapter | null>(null);

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      const r = await runTests({
        language: impl.language,
        studentCode: code,
        tests: impl.tests,
        timeoutMs: 4000,
      });
      setResult(r);
    } finally {
      setRunning(false);
    }
  }, [code, impl.language, impl.tests]);

  const handleReset = useCallback(() => {
    setCode(impl.starterCode || '');
    setResult(null);
  }, [impl.starterCode]);

  const handleRevealSolution = useCallback(() => {
    setCode(impl.solutionCode);
    setResult(null);
  }, [impl.solutionCode]);

  return (
    <StageScaffold
      title="Now you write it"
      description="Write code that makes the tests pass. Tap the on-screen keyboard for common tokens, or use Alt+1..9 on desktop."
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

      <label className="text-sm font-semibold text-[var(--cc-fg-muted)]">Your code:</label>
      <LazyMonacoEditor
        value={code}
        onChange={setCode}
        language={impl.language}
        onAdapter={setAdapter}
        heightLines={Math.max(8, code.split('\n').length + 2)}
      />

      {adapter && (
        <CodeKeyboard
          language={impl.language}
          adapter={adapter}
          lessonPalette={lesson.codeKeyboard?.lessonPalette}
          disableBaseTokens={lesson.codeKeyboard?.disableBaseTokens}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" size="sm" onClick={handleRun} disabled={running}>
          {running ? 'Running…' : '▶ Run tests'}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleReset} disabled={running}>
          Reset
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRevealSolution} disabled={running}>
          Reveal solution
        </Button>
      </div>

      {result && <TestResults result={result} tests={impl.tests} />}

      <details className="rounded-md border border-[var(--cc-border)] bg-[var(--cc-surface)] p-3">
        <summary className="cursor-pointer text-sm font-medium">Show canonical solution</summary>
        <CodeBlock code={impl.solutionCode} className="mt-2" />
      </details>
    </StageScaffold>
  );
}

function TestResults({
  result,
  tests,
}: {
  result: TestRunResult;
  tests: { id: string; description: string; failureHint?: string }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-2"
    >
      <p
        className={cn(
          'text-sm font-semibold',
          result.allPassed ? 'text-[var(--cc-success)]' : 'text-[var(--cc-danger)]',
        )}
      >
        {result.allPassed
          ? `All ${result.outcomes.length} tests passed in ${Math.round(result.totalDurationMs)}ms.`
          : `${result.outcomes.filter((o) => !o.passed).length} of ${result.outcomes.length} failing.`}
      </p>
      <ul className="space-y-2">
        {result.outcomes.map((outcome) => {
          const meta = tests.find((t) => t.id === outcome.testId);
          return (
            <li
              key={outcome.testId}
              className={cn(
                'rounded-lg border p-3 text-sm',
                outcome.passed
                  ? 'border-[var(--cc-success)] bg-[var(--cc-success)]/10'
                  : 'border-[var(--cc-danger)] bg-[var(--cc-danger)]/10',
              )}
            >
              <p className="font-medium">
                <span className="mr-2">{outcome.passed ? '✓' : '✗'}</span>
                {meta?.description ?? outcome.testId}
              </p>
              {!outcome.passed && outcome.message && (
                <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{outcome.message}</pre>
              )}
              {!outcome.passed && meta?.failureHint && (
                <p className="mt-1 text-xs text-[var(--cc-fg-muted)]">{meta.failureHint}</p>
              )}
              {outcome.consoleLog && outcome.consoleLog.length > 0 && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-[var(--cc-fg-muted)]">
                    console output ({outcome.consoleLog.length} line
                    {outcome.consoleLog.length === 1 ? '' : 's'})
                  </summary>
                  <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">
                    {outcome.consoleLog.join('\n')}
                  </pre>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
