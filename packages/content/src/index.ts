import type { Lesson, Language } from '@codecraft/schema';

/**
 * Lesson registry.
 *
 * Lessons live in language-specific subdirectories at the package root:
 *   packages/content/javascript/01-variables/lesson.ts
 *
 * Each lesson.ts file default-exports the result of `defineLesson(...)`.
 * The five v1 JS lessons get registered here by the `five_js_lessons` todo.
 */
const lessons: Lesson[] = [];

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
