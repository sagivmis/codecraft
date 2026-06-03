import type { FixTheBugStage } from '@codecraft/schema';

export type CheckResult =
  | { kind: 'pass'; feedback?: string }
  | { kind: 'fail'; reason: string };

/**
 * Deterministic equivalence check used by Stage 2.
 *
 * Comparison strategies, in order:
 *   1. Each entry in `acceptableSolutions` (exact / regex / normalized).
 *   2. The canonical `solutionCode` itself, compared with "normalized" semantics.
 *
 * "normalized" collapses whitespace runs to a single space, strips trailing
 * semicolons inside lines (so `let x = 0` and `let x=0;` are equivalent), and
 * unifies quote style for string literals. This keeps the checker pedagogical
 * (students shouldn't fail because of an extra space) without becoming a full
 * AST equivalence engine.
 */
export function checkSolution(
  studentCode: string,
  stage: FixTheBugStage,
): CheckResult {
  /* If the student didn't change anything, fail immediately with a clearer
   * message than "exact mismatch". */
  if (studentCode === stage.buggyCode) {
    return { kind: 'fail', reason: 'Code is unchanged - look for the bug and try again.' };
  }

  for (const candidate of stage.acceptableSolutions ?? []) {
    if (compare(studentCode, candidate.value, candidate.matcher)) {
      return {
        kind: 'pass',
        ...(candidate.feedback ? { feedback: candidate.feedback } : {}),
      };
    }
  }

  if (compare(studentCode, stage.solutionCode, 'normalized')) {
    return { kind: 'pass' };
  }

  return { kind: 'fail', reason: 'Not quite. Try a hint or compare with the expected solution.' };
}

function compare(
  student: string,
  candidate: string,
  matcher: 'exact' | 'regex' | 'normalized',
): boolean {
  switch (matcher) {
    case 'exact':
      return student === candidate;
    case 'regex':
      try {
        const re = new RegExp(candidate, 'm');
        return re.test(student);
      } catch {
        return false;
      }
    case 'normalized':
      return normalize(student) === normalize(candidate);
  }
}

export function normalize(code: string): string {
  return code
    /* Single-line comments + block comments are stripped for comparison. */
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    /* Quote style unified to double-quotes for string literals (only the
     * simple non-escaped case - good enough for early lessons). */
    .replace(/'([^'\\]*)'/g, '"$1"')
    /* Collapse whitespace runs to a single space, strip line trailing semis. */
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').replace(/;\s*$/, '').trim())
    .filter((line) => line.length > 0)
    .join('\n');
}
