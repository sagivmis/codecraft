import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllLessons } from '@codecraft/content';
import { Button, Card, useTheme, cn } from '@codecraft/ui';
import { STAGE_KEYS, STAGE_LABELS } from '../lesson-player/types.js';
import { makeInitialProgress, type LessonProgress } from '../lesson-player/types.js';

/**
 * Internal QA dashboard. NOT linked from the student-facing nav; reach it
 * by URL at /preview. Lets you:
 *   - Jump to any stage of any lesson in one click
 *   - Toggle between Kids and Teens themes globally
 *   - Reset progress for one lesson or all lessons
 *   - See progress state at a glance
 *
 * Will be visually surfaced as a permanent link only in dev mode (TODO once
 * we have a "from=preview" return crumb on the player). For now you bookmark
 * the URL.
 */
export function PreviewDashboard() {
  const { theme, setTheme } = useTheme();
  const lessons = useMemo(() => getAllLessons(), []);
  const [bump, setBump] = useState(0); // force-rerender after storage edits

  const readProgress = useCallback((lessonId: string): LessonProgress => {
    try {
      const raw = window.localStorage.getItem(`codecraft.progress.${lessonId}`);
      if (!raw) return makeInitialProgress(lessonId);
      return JSON.parse(raw) as LessonProgress;
    } catch {
      return makeInitialProgress(lessonId);
    }
  }, []);

  const resetLesson = useCallback((lessonId: string) => {
    window.localStorage.removeItem(`codecraft.progress.${lessonId}`);
    setBump((b) => b + 1);
  }, []);

  const resetAll = useCallback(() => {
    const keys = Object.keys(window.localStorage).filter(
      (k) => k.startsWith('codecraft.progress.') || k.startsWith('codecraft:engagement:'),
    );
    for (const k of keys) window.localStorage.removeItem(k);
    setBump((b) => b + 1);
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-4 py-8 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-sm text-[var(--cc-fg-muted)] hover:text-[var(--cc-fg)]">
            ← Home
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Preview Dashboard</h1>
          <p className="text-sm text-[var(--cc-fg-muted)]">
            Internal QA tool. Jump to any stage, flip themes, reset progress.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[var(--cc-fg-muted)]">Theme:</span>
          <Button
            variant={theme === 'kids' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme('kids')}
          >
            Kids
          </Button>
          <Button
            variant={theme === 'teens' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme('teens')}
          >
            Teens
          </Button>
          <Button variant="danger" size="sm" onClick={resetAll}>
            Reset all progress
          </Button>
        </div>
      </header>

      {lessons.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--cc-fg-muted)]">No lessons registered yet.</p>
        </Card>
      ) : (
        <ul key={bump} className="grid gap-4">
          {lessons.map((lesson) => {
            const progress = readProgress(lesson.id);
            return (
              <li key={lesson.id}>
                <Card className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--cc-fg-muted)]">
                        <span className="font-mono">{lesson.id}</span>
                        <span>•</span>
                        <span>{lesson.language}</span>
                        <span>•</span>
                        <span>{lesson.tier}</span>
                        <span>•</span>
                        <span>~{lesson.estimatedMinutes} min</span>
                      </div>
                      <div className="mt-1 grid gap-1 sm:grid-cols-2">
                        <div>
                          <span className="text-xs font-semibold uppercase text-[var(--cc-fg-muted)]">
                            Kids title
                          </span>
                          <p className="text-base font-semibold">{lesson.variants.kids.title}</p>
                          {lesson.variants.kids.subtitle && (
                            <p className="text-xs text-[var(--cc-fg-muted)]">
                              {lesson.variants.kids.subtitle}
                            </p>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase text-[var(--cc-fg-muted)]">
                            Teens title
                          </span>
                          <p className="text-base font-semibold">{lesson.variants.teens.title}</p>
                          {lesson.variants.teens.subtitle && (
                            <p className="text-xs text-[var(--cc-fg-muted)]">
                              {lesson.variants.teens.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {lesson.concepts.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-[var(--cc-surface-hover)] px-2 py-0.5 font-mono text-xs"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => resetLesson(lesson.id)}>
                      Reset this lesson
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-[var(--cc-border)] pt-3">
                    <span className="text-xs font-semibold uppercase text-[var(--cc-fg-muted)]">
                      Jump to stage:
                    </span>
                    {STAGE_KEYS.map((stage) => {
                      const status = progress.stages[stage]?.status ?? 'not-started';
                      return (
                        <Link
                          key={stage}
                          to={`/lessons/${lesson.id}/${stage}`}
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs',
                            'border-[var(--cc-border)] bg-[var(--cc-surface)] hover:bg-[var(--cc-surface-hover)]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus-ring)]',
                          )}
                          title={`Status: ${status}`}
                        >
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              status === 'completed' && 'bg-[var(--cc-success)]',
                              status === 'in-progress' && 'bg-[var(--cc-primary)]',
                              status === 'attempted' && 'bg-[var(--cc-fg-muted)]',
                              status === 'not-started' && 'bg-[var(--cc-border)]',
                            )}
                          />
                          {STAGE_LABELS[stage]}
                        </Link>
                      );
                    })}
                    <Link
                      to={`/lessons/${lesson.id}/complete`}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs',
                        'border-[var(--cc-border)] bg-[var(--cc-surface)] hover:bg-[var(--cc-surface-hover)]',
                      )}
                    >
                      Complete screen
                    </Link>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
