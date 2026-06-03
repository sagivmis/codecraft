import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@codecraft/ui';
import type { Language, TokenSpec } from '@codecraft/schema';
import { TokenButton } from './TokenButton.js';
import { resolvePalette } from './palettes.js';
import type { EditorAdapter } from './types.js';
import { useIsTouchDevice, useSoftKeyboardOffset } from './useMobileKeyboard.js';

type CodeKeyboardProps = {
  language: Language;
  adapter: EditorAdapter;
  lessonPalette?: TokenSpec[];
  disableBaseTokens?: string[];
};

/**
 * The on-screen Code Keyboard.
 *
 * Layout switches based on device:
 *   - Touch device with soft keyboard up: fixed-position bar pinned just
 *     above the keyboard via visualViewport offset
 *   - Touch device without keyboard up: fixed bar at bottom of viewport
 *   - Desktop: collapsible inline bar above/below the editor, with
 *     Alt+1..Alt+9 shortcuts for the first 9 lesson tokens
 *
 * Three-tier merge happens in `resolvePalette`. The result is grouped so the
 * lesson palette renders first (always visible), then a divider, then
 * language tokens, then a second divider, then the base palette.
 */
export function CodeKeyboard({
  language,
  adapter,
  lessonPalette,
  disableBaseTokens,
}: CodeKeyboardProps) {
  const isTouch = useIsTouchDevice();
  const keyboardOffset = useSoftKeyboardOffset();
  const [collapsed, setCollapsed] = useState(!isTouch);

  const palette = useMemo(
    () => resolvePalette({ language, lessonPalette, disableBaseTokens }),
    [disableBaseTokens, language, lessonPalette],
  );

  const insertToken = useCallback(
    (token: TokenSpec) => {
      adapter.insertText(token.insert);
      adapter.focus();
    },
    [adapter],
  );

  /* Desktop Alt+1..9 shortcuts: bind only on desktop. */
  useEffect(() => {
    if (isTouch) return;
    const handler = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > 9) return;
      const token = palette.lesson[n - 1];
      if (!token) return;
      e.preventDefault();
      insertToken(token);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [insertToken, isTouch, palette.lesson]);

  if (!isTouch && collapsed) {
    return (
      <div className="my-2 flex">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border border-[var(--cc-border)]',
            'bg-[var(--cc-surface)] px-3 py-1.5 text-sm hover:bg-[var(--cc-surface-hover)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus-ring)]',
          )}
        >
          <span>⌨ Show code keyboard</span>
          <span className="text-xs text-[var(--cc-fg-muted)]">(Alt+1..9 to insert)</span>
        </button>
      </div>
    );
  }

  const fixedToBottom = isTouch;

  return (
    <div
      className={cn(
        fixedToBottom
          ? 'fixed inset-x-0 z-40 border-t border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-lg'
          : 'sticky bottom-0 my-2 rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-sm',
      )}
      style={
        fixedToBottom
          ? { bottom: keyboardOffset, paddingBottom: 'env(safe-area-inset-bottom)' }
          : undefined
      }
      role="toolbar"
      aria-label="Code keyboard"
    >
      <div className="flex items-center gap-2 overflow-x-auto px-2 py-2">
        {palette.lesson.length > 0 && (
          <>
            <PaletteGroup
              tokens={palette.lesson}
              onInsert={insertToken}
              shortcutPrefix={isTouch ? undefined : 'Alt'}
              ariaLabel="Lesson tokens"
            />
            <Divider />
          </>
        )}
        <PaletteGroup tokens={palette.language} onInsert={insertToken} ariaLabel="Language tokens" />
        {palette.base.length > 0 && (
          <>
            <Divider />
            <PaletteGroup tokens={palette.base} onInsert={insertToken} ariaLabel="Common tokens" />
          </>
        )}
        {!isTouch && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className={cn(
              'ml-auto shrink-0 rounded-md px-2 py-1 text-xs text-[var(--cc-fg-muted)]',
              'hover:bg-[var(--cc-surface-hover)]',
            )}
            aria-label="Hide code keyboard"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function PaletteGroup({
  tokens,
  onInsert,
  shortcutPrefix,
  ariaLabel,
}: {
  tokens: TokenSpec[];
  onInsert: (token: TokenSpec) => void;
  shortcutPrefix?: string;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={ariaLabel}>
      {tokens.map((token, i) => (
        <TokenButton
          key={`${token.label}-${i}`}
          token={token}
          onInsert={onInsert}
          shortcutLabel={shortcutPrefix && i < 9 ? `${shortcutPrefix}+${i + 1}` : undefined}
        />
      ))}
    </div>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-7 w-px shrink-0 bg-[var(--cc-border)]" />;
}
