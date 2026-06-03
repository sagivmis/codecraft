import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-[var(--cc-fg-muted)]">We could not find what you were looking for.</p>
      <Link to="/" className="text-[var(--cc-primary)] underline">
        Back to the home page
      </Link>
    </main>
  );
}
