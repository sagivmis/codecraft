/**
 * A tiny Jest-style expect() API. Used inside the test runner worker but
 * exported so unit tests (and stage previews) can use it too.
 *
 * Authoring a test in a lesson:
 *   expect(add(2, 3)).toBe(5)
 *   expect(items).toEqual([1, 2, 3])
 *   expect(name).toContain('Sagiv')
 *   expect(() => parse('oops')).toThrow()
 *   expect(0.1 + 0.2).toBeCloseTo(0.3)
 */

export class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

export type Matchers<T> = {
  toBe(expected: T): void;
  toEqual(expected: unknown): void;
  toContain(expected: unknown): void;
  toBeCloseTo(expected: number, precision?: number): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeDefined(): void;
  toBeUndefined(): void;
  toBeNull(): void;
  toBeGreaterThan(expected: number): void;
  toBeLessThan(expected: number): void;
  toThrow(messageMatch?: string | RegExp): void;
  not: Omit<Matchers<T>, 'not'>;
};

export function expect<T>(actual: T): Matchers<T> {
  return buildMatchers(actual, false);
}

function buildMatchers<T>(actual: T, negated: boolean): Matchers<T> {
  function check(passed: boolean, message: () => string): void {
    const ok = negated ? !passed : passed;
    if (!ok) {
      throw new AssertionError(`${negated ? 'NOT ' : ''}${message()}`);
    }
  }

  const matchers: Matchers<T> = {
    toBe(expected) {
      check(
        Object.is(actual, expected),
        () => `Expected ${fmt(actual)} to be ${fmt(expected)} (strict equality).`,
      );
    },
    toEqual(expected) {
      check(
        deepEqual(actual, expected),
        () => `Expected ${fmt(actual)} to deeply equal ${fmt(expected)}.`,
      );
    },
    toContain(expected) {
      const a = actual as unknown;
      const ok =
        (typeof a === 'string' && a.includes(String(expected))) ||
        (Array.isArray(a) && a.some((v) => Object.is(v, expected))) ||
        (a instanceof Set && a.has(expected));
      check(ok, () => `Expected ${fmt(actual)} to contain ${fmt(expected)}.`);
    },
    toBeCloseTo(expected, precision = 2) {
      const a = Number(actual as unknown);
      const epsilon = Math.pow(10, -precision) / 2;
      check(
        Math.abs(a - expected) < epsilon,
        () => `Expected ${fmt(actual)} to be close to ${expected} (precision ${precision}).`,
      );
    },
    toBeTruthy() {
      check(!!actual, () => `Expected ${fmt(actual)} to be truthy.`);
    },
    toBeFalsy() {
      check(!actual, () => `Expected ${fmt(actual)} to be falsy.`);
    },
    toBeDefined() {
      check(actual !== undefined, () => `Expected value to be defined.`);
    },
    toBeUndefined() {
      check(actual === undefined, () => `Expected value to be undefined, got ${fmt(actual)}.`);
    },
    toBeNull() {
      check(actual === null, () => `Expected value to be null, got ${fmt(actual)}.`);
    },
    toBeGreaterThan(expected) {
      check(
        Number(actual as unknown) > expected,
        () => `Expected ${fmt(actual)} to be greater than ${expected}.`,
      );
    },
    toBeLessThan(expected) {
      check(
        Number(actual as unknown) < expected,
        () => `Expected ${fmt(actual)} to be less than ${expected}.`,
      );
    },
    toThrow(messageMatch) {
      if (typeof actual !== 'function') {
        throw new AssertionError(`expect(...).toThrow() needs a function, got ${fmt(actual)}.`);
      }
      let caught: unknown;
      try {
        (actual as () => unknown)();
      } catch (err) {
        caught = err;
      }
      const didThrow = caught !== undefined;
      let matches = didThrow;
      if (didThrow && messageMatch !== undefined) {
        const msg = caught instanceof Error ? caught.message : String(caught);
        matches =
          messageMatch instanceof RegExp ? messageMatch.test(msg) : msg.includes(messageMatch);
      }
      check(matches, () =>
        messageMatch === undefined
          ? `Expected function to throw.`
          : `Expected function to throw matching ${fmt(messageMatch)}.`,
      );
    },
    /** Lazy: built only when accessed so we don't pre-allocate inverse matchers. */
    get not() {
      return buildMatchers(actual, !negated);
    },
  };

  return matchers;
}

/* ---------------------- helpers ---------------------- */

function fmt(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'function') return '[Function]';
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (a instanceof RegExp && b instanceof RegExp)
    return a.source === b.source && a.flags === b.flags;

  const aKeys = Object.keys(a as object).sort();
  const bKeys = Object.keys(b as object).sort();
  if (aKeys.length !== bKeys.length) return false;
  for (let i = 0; i < aKeys.length; i++) {
    if (aKeys[i] !== bKeys[i]) return false;
  }
  for (const k of aKeys) {
    if (!deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) {
      return false;
    }
  }
  return true;
}

/** Format any thrown value (including non-Errors) into a friendly string. */
export function formatThrown(err: unknown): string {
  if (err instanceof AssertionError) return err.message;
  if (err instanceof Error) {
    /* Strip the noisy stack from typical runtime errors so students see the
     * actual problem first. We keep just the error name + message. */
    return `${err.name}: ${err.message}`;
  }
  return fmt(err);
}
