import type { TestRunRequest, TestRunResult, TestOutcome } from './types.js';

/**
 * Client wrapper around the test runner Web Worker.
 *
 * Vite's `new Worker(new URL(...), { type: 'module' })` pattern handles
 * bundling - this works inside any Vite-bundled consumer.
 *
 * The runner keeps a single long-lived worker. If a request exceeds the
 * configured wall-clock timeout (e.g. infinite loop), the worker is
 * terminated and replaced. Subsequent calls automatically spin up a fresh
 * worker.
 */

let workerInstance: Worker | null = null;
let nextRequestId = 0;

function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(new URL('./worker/testRunner.worker.ts', import.meta.url), {
      type: 'module',
      name: 'codecraft-test-runner',
    });
  }
  return workerInstance;
}

function killWorker(): void {
  workerInstance?.terminate();
  workerInstance = null;
}

const DEFAULT_TIMEOUT_MS = 4000;

export async function runTests(request: TestRunRequest): Promise<TestRunResult> {
  const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const requestId = String(++nextRequestId);
  const started = performance.now();

  const worker = getWorker();

  return new Promise<TestRunResult>((resolve) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      killWorker();
      resolve({
        outcomes: request.tests.map<TestOutcome>((t) => ({
          testId: t.id,
          passed: false,
          message: `Timed out after ${timeoutMs}ms. Your code may have an infinite loop.`,
          consoleLog: [],
          durationMs: timeoutMs,
        })),
        allPassed: false,
        totalDurationMs: performance.now() - started,
      });
    }, timeoutMs);

    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || data.requestId !== requestId) return;
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);

      if (data.kind === 'compileError') {
        const message: string = data.message ?? 'Failed to parse your code.';
        resolve({
          outcomes: request.tests.map<TestOutcome>((t) => ({
            testId: t.id,
            passed: false,
            message,
            consoleLog: [],
            durationMs: 0,
          })),
          allPassed: false,
          totalDurationMs: performance.now() - started,
        });
        return;
      }

      if (data.kind === 'result') {
        const outcomes = data.outcomes as TestOutcome[];
        resolve({
          outcomes,
          allPassed: outcomes.every((o) => o.passed),
          totalDurationMs: performance.now() - started,
        });
      }
    }

    function onError(event: ErrorEvent) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      killWorker();
      resolve({
        outcomes: request.tests.map<TestOutcome>((t) => ({
          testId: t.id,
          passed: false,
          message: event.message || 'Unexpected worker error.',
          consoleLog: [],
          durationMs: 0,
        })),
        allPassed: false,
        totalDurationMs: performance.now() - started,
      });
    }

    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage({ kind: 'run', requestId, request });
  });
}
