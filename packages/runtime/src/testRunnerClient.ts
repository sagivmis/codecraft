import type { TestRunRequest, TestRunResult } from './types.js';

/**
 * Client-side stub. Spawns the Web Worker that lives in
 * ./worker/testRunner.worker.ts and posts the request to it.
 *
 * Real implementation lands in the `test_runner_worker` todo. For now this
 * throws so anyone calling it accidentally gets a clear error.
 */
export async function runTests(_request: TestRunRequest): Promise<TestRunResult> {
  throw new Error(
    '[@codecraft/runtime] runTests is not yet implemented. ' +
      'Will be filled in by the test_runner_worker task.',
  );
}
