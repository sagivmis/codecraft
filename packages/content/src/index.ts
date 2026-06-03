import type { Lesson, Language } from '@codecraft/schema';
import variablesLesson from '../javascript/01-variables/lesson.js';
import conditionalsLesson from '../javascript/02-conditionals/lesson.js';
import functionsLesson from '../javascript/03-functions/lesson.js';
import arraysLesson from '../javascript/04-arrays-iteration/lesson.js';
import objectsLesson from '../javascript/05-objects-mini-project/lesson.js';

/**
 * Lesson registry.
 *
 * Lessons live in language-specific subdirectories at the package root:
 *   packages/content/javascript/01-variables/lesson.ts
 *
 * Each lesson.ts file default-exports the result of `defineLesson(...)`.
 */
const lessons: Lesson[] = [
  variablesLesson,
  conditionalsLesson,
  functionsLesson,
  arraysLesson,
  objectsLesson,
];

export function getAllLessons(): Lesson[] {
  return [...lessons].sort((a, b) => {
    if (a.language !== b.language) return a.language.localeCompare(b.language);
    return a.order - b.order;
  });
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function getLessonsForLanguage(language: Language): Lesson[] {
  return getAllLessons().filter((l) => l.language === language);
}
