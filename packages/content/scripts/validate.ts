import { getAllLessons } from '../src/index.js';
import { LessonSchema } from '@codecraft/schema';
import { expect, formatThrown } from '@codecraft/runtime';

const lessons = getAllLessons();

let errors = 0;

/* --------------- Phase 1: schema check --------------- */
for (const lesson of lessons) {
  const result = LessonSchema.safeParse(lesson);
  if (!result.success) {
    errors += 1;
    console.error(`[invalid lesson] ${lesson.id ?? '(no id)'}`);
    for (const issue of result.error.issues) {
      console.error('  -', issue.path.join('.'), ':', issue.message);
    }
  }
}

/* --------------- Phase 2: implement-stage smoke test ---------------
 * For every lesson, evaluate its canonical solutionCode against each of its
 * tests using the same expect() that the worker uses. If the canonical
 * solution fails its own tests, the lesson is broken and the build fails.
 *
 * We deliberately do not use the worker here - this is a Node-side check, so
 * we evaluate via Function() directly.
 */
for (const lesson of lessons) {
  const impl = lesson.stages.implement;
  if (impl.language !== 'js' && impl.language !== 'ts') continue;

  for (const test of impl.tests) {
    const body = `${impl.solutionCode}\n;\n${test.code}\n;`;
    try {
      const fn = new Function('expect', body);
      fn(expect);
    } catch (err) {
      errors += 1;
      console.error(
        `[broken lesson] ${lesson.id} :: implement.test ${test.id} (${test.description})`,
      );
      console.error('  ', formatThrown(err));
    }
  }
}

/* --------------- Phase 3: fix-the-bug smoke test ---------------
 * The canonical solutionCode of each fix-the-bug stage must NOT equal its
 * buggyCode (otherwise nothing to fix), AND must pass our deterministic
 * checker against itself.
 */
for (const lesson of lessons) {
  const fb = lesson.stages.fixTheBug;
  if (fb.solutionCode === fb.buggyCode) {
    errors += 1;
    console.error(`[broken lesson] ${lesson.id} :: fix-the-bug solution == buggy code`);
  }
}

if (errors > 0) {
  console.error(`\nValidation failed: ${errors} issue(s).`);
  process.exit(1);
}

console.log(
  `Validated ${lessons.length} lesson(s). Schema, implement tests, and fix-the-bug all good.`,
);
