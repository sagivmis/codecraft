/// <reference lib="webworker" />

/**
 * Stub Web Worker for the test runner.
 *
 * Will be implemented by the `test_runner_worker` todo with:
 *   - Lightweight expect() API surface (.toBe, .toEqual, .toThrow, .toContain)
 *   - Per-test timeout via Worker timer
 *   - Sandboxed Function() execution (no global access to the host)
 *   - Console.log capture
 */

declare const self: DedicatedWorkerGlobalScope;

self.addEventListener('message', (event: MessageEvent) => {
  self.postMessage({
    kind: 'not-implemented',
    received: event.data,
  });
});

export {};
