import { Link } from 'react-router-dom';
import { getAllLessons } from '@codecraft/content';
import { Button, Card, useTheme } from '@codecraft/ui';

const TIER_LABELS = {
  easy: 'Easy',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const;

const LANG_LABELS = {
  js: 'JavaScript',
  ts: 'TypeScript',
  python: 'Python',
  csharp: 'C#',
} as const;

export function LessonsIndexPage() {
  const { theme, setTheme } = useTheme();
  const lessons = getAllLessons();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-sm text-[var(--cc-fg-muted)] hover:text-[var(--cc-fg)]">
            ← Home
          </Link>
          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Lessons</h1>
          <p className="text-[var(--cc-fg-muted)]">Pick a lesson to start. More are on the way.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--cc-fg-muted)]">Track:</span>
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
        </div>
      </header>

      {lessons.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--cc-fg-muted)]">No lessons yet. Check back soon.</p>
        </Card>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {lessons.map((lesson) => {
            const variant = lesson.variants[theme];
            return (
              <li key={lesson.id}>
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus-ring)] rounded-2xl"
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[var(--cc-fg-muted)]">
                      <span>{LANG_LABELS[lesson.language]}</span>
                      <span>{TIER_LABELS[lesson.tier]}</span>
                    </div>
                    <h2 className="mt-2 text-xl font-bold">{variant.title}</h2>
                    {variant.subtitle && (
                      <p className="mt-1 text-sm text-[var(--cc-fg-muted)]">{variant.subtitle}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {lesson.concepts.slice(0, 4).map((c) => (
                        <span
                          key={c}
                          className="rounded-full bg-[var(--cc-surface-hover)] px-2 py-0.5 font-mono text-xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-[var(--cc-fg-muted)]">
                      ~{lesson.estimatedMinutes} min
                    </p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
