import { Suspense, lazy, type ComponentProps } from 'react';

const MonacoEditor = lazy(() =>
  import('./MonacoEditor.js').then((mod) => ({ default: mod.MonacoEditor })),
);

/**
 * Lazy-loaded wrapper. Monaco is heavy (~1.2 MB gzipped), so we defer the
 * chunk until the student actually reaches a coding stage. The Suspense
 * fallback mirrors the inline 'Loading editor…' state so users see one
 * consistent placeholder no matter where the delay comes from.
 */
export function LazyMonacoEditor(props: ComponentProps<typeof MonacoEditor>) {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center rounded-xl border border-[var(--cc-border)] bg-[var(--cc-code-bg)] text-sm text-[var(--cc-fg-muted)]">
          Loading editor…
        </div>
      }
    >
      <MonacoEditor {...props} />
    </Suspense>
  );
}
