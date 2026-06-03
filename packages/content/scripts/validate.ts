import { getAllLessons } from '../src/index.js';
import { LessonSchema } from '@codecraft/schema';

const lessons = getAllLessons();

let errors = 0;
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

if (errors > 0) {
  console.error(`\nValidation failed: ${errors} invalid lesson(s).`);
  process.exit(1);
}

console.log(`Validated ${lessons.length} lesson(s). All good.`);
