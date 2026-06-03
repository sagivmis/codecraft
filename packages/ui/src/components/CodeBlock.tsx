import type { ReactNode } from 'react';
import { cn } from '../utils/cn.js';

type CodeBlockProps = {
  code: string;
  language?: string;
  className?: string;
  children?: ReactNode;
};

export function CodeBlock({ code, language, className, children }: CodeBlockProps) {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-xl border border-[var(--cc-border)] bg-[var(--cc-code-bg)] ' +
          'p-4 font-mono text-sm leading-relaxed text-[var(--cc-code-fg)]',
        className,
      )}
      data-language={language}
    >
      <code>{children ?? code}</code>
    </pre>
  );
}
