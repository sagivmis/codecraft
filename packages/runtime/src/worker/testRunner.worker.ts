/// <reference lib="webworker" />

import { expect, formatThrown } from '../expect.js';
import type { TestOutcome, TestRunRequest } from '../types.js';

/**
 * Test runner Web Worker.
 *
 * Protocol:
 *   in:  { kind: 'run', requestId, request: TestRunRequest }
 *   out: { kind: 'result', requestId, outcomes }
 *        { kind: 'compileError', requestId, message }
 *        { kind: 'unexpected', requestId, message }
 *
 * Each test runs in its own freshly-constructed Function scope so the
 * student's code is re-evaluated per test - this isolates state mutations
 * across tests (a test that reassigns a `let` does not bleed into the next).
 *
 * Sandboxing notes:
 * - Workers cannot reach the parent window's DOM.
 * - We do not pass globalThis into the Function() call; student code can
 *   still access self/fetch, but cannot read this worker's closure.
 * - Catastrophic infinite loops are handled at the client side via a
 *   wall-clock timeout that terminates the worker.
 */

declare const self: DedicatedWorkerGlobalScope;

type Inbound = {
  kind: 'run';
  requestId: string;
  request: TestRunRequest;
};

self.addEventListener('message', (event: MessageEvent<Inbound>) => {
  const data = event.data;
  if (!data || data.kind !== 'run') return;

  const { requestId, request } = data;

  /* Quick syntax-check the student's code up front. If it cannot parse,
   * all tests would fail with the same compile error - cleaner to surface
   * once at the top. */
  try {
    new Function(request.studentCode + '\n;');
  } catch (err) {
    self.postMessage({
      kind: 'compileError',
      requestId,
      message: formatThrown(err),
    });
    return;
  }

  const outcomes: TestOutcome[] = [];

  for (const test of request.tests) {
    const start = performance.now();
    const log: string[] = [];

    /* Per-test sandboxed console - the student's code may use console.log
     * for debugging; we capture it so the UI can show it next to the result. */
    const sandboxConsole = {
      log: (...args: unknown[]) => log.push(args.map(stringify).join(' ')),
      info: (...args: unknown[]) => log.push(args.map(stringify).join(' ')),
      warn: (...args: unknown[]) => log.push('[warn] ' + args.map(stringify).join(' ')),
      error: (...args: unknown[]) => log.push('[error] ' + args.map(stringify).join(' ')),
    };

    try {
      const body = `${request.studentCode}\n;\n${test.code}\n;`;
      const fn = new Function('expect', 'console', body);
      fn(expect, sandboxConsole);
      outcomes.push({
        testId: test.id,
        passed: true,
        consoleLog: log,
        durationMs: performance.now() - start,
      });
    } catch (err) {
      outcomes.push({
        testId: test.id,
        passed: false,
        message: formatThrown(err),
        consoleLog: log,
        durationMs: performance.now() - start,
      });
    }
  }

  self.postMessage({ kind: 'result', requestId, outcomes });
});

function stringify(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'function') return '[Function]';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export {};
