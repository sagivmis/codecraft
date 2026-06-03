import { Button, Card, useTheme } from '@codecraft/ui';

export function LandingPage() {
  const { theme, setTheme } = useTheme();
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-4 py-10 md:py-16">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">CodeCraft</h1>
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

      <section className="space-y-3">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          Learn to code, one tiny step at a time.
        </h2>
        <p className="text-lg text-[var(--cc-fg-muted)]">
          Interactive lessons in JavaScript, TypeScript and more. Watch, fix, build. Designed for
          ages 9 to 18.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button size="lg">Start the first lesson</Button>
          <Button size="lg" variant="secondary">
            Browse the curriculum
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold">Five stages per lesson</h3>
          <p className="mt-1 text-sm text-[var(--cc-fg-muted)]">
            Hook, animated walkthrough, mini-quiz, fix-the-bug, and a real coding task.
          </p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold">Works on your phone</h3>
          <p className="mt-1 text-sm text-[var(--cc-fg-muted)]">
            A custom on-screen Code Keyboard makes real typing viable on mobile.
          </p>
        </Card>
      </section>
    </main>
  );
}
