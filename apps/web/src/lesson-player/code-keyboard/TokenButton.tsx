import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@codecraft/ui';
import type { TokenSpec } from '@codecraft/schema';

const LONG_PRESS_MS = 450;

type TokenButtonProps = {
  token: TokenSpec;
  onInsert: (token: TokenSpec) => void;
  /** If supplied, displayed as a small shortcut hint in the corner. */
  shortcutLabel?: string;
};

/**
 * A single tap target on the Code Keyboard.
 *
 * Behavior:
 *   - tap     → fire `onInsert(token)`
 *   - long-press (touch) or right-click (mouse) → open variants menu
 *   - selecting a variant fires `onInsert(variant)`
 *
 * The variants menu uses a small abs-positioned panel rather than a portal so
 * it stays inside the keyboard bar's scrollable row on mobile.
 */
export function TokenButton({ token, onInsert, shortcutLabel }: TokenButtonProps) {
  const [variantsOpen, setVariantsOpen] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasVariants = !!token.variants && token.variants.length > 0;

  const clearLongPress = useCallback(() => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  /* Close variants when the user taps elsewhere. */
  useEffect(() => {
    if (!variantsOpen) return;
    const handler = (e: PointerEvent) => {
      const root = containerRef.current;
      if (root && !root.contains(e.target as Node)) {
        setVariantsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [variantsOpen]);

  const onPointerDown = useCallback(() => {
    if (!hasVariants) return;
    longPressFiredRef.current = false;
    longPressTimer.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      setVariantsOpen(true);
    }, LONG_PRESS_MS);
  }, [hasVariants]);

  const onPointerUp = useCallback(() => {
    clearLongPress();
  }, [clearLongPress]);

  const onClick = useCallback(() => {
    /* If the long-press fired and opened the menu, swallow the click. */
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    onInsert(token);
  }, [onInsert, token]);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (!hasVariants) return;
      e.preventDefault();
      setVariantsOpen(true);
    },
    [hasVariants],
  );

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
        onContextMenu={onContextMenu}
        title={token.description}
        aria-label={token.description ?? token.label}
        aria-haspopup={hasVariants ? 'menu' : undefined}
        aria-expanded={hasVariants ? variantsOpen : undefined}
        className={cn(
          'relative inline-flex items-center justify-center rounded-lg border',
          'border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-fg)]',
          'font-mono text-sm font-medium leading-none',
          'transition-colors hover:bg-[var(--cc-surface-hover)]',
          'active:bg-[var(--cc-primary)] active:text-[var(--cc-primary-fg)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-focus-ring)]',
          'select-none',
        )}
        style={{
          minWidth: 'var(--cc-tap-target)',
          minHeight: 'var(--cc-tap-target)',
          paddingInline: '0.75rem',
        }}
      >
        <span>{token.label}</span>
        {hasVariants && (
          <span
            aria-hidden
            className="absolute right-1 top-0.5 text-[0.55rem] leading-none text-[var(--cc-fg-muted)]"
          >
            ▾
          </span>
        )}
        {shortcutLabel && (
          <span
            aria-hidden
            className="absolute bottom-0.5 right-1 text-[0.55rem] leading-none text-[var(--cc-fg-muted)]"
          >
            {shortcutLabel}
          </span>
        )}
      </button>

      {variantsOpen && token.variants && (
        <div
          role="menu"
          className={cn(
            'absolute bottom-[calc(100%+0.5rem)] left-1/2 z-50 -translate-x-1/2',
            'flex gap-1 rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-1 shadow-lg',
          )}
        >
          {token.variants.map((variant) => (
            <button
              key={variant.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setVariantsOpen(false);
                onInsert(variant);
              }}
              className={cn(
                'rounded-md px-3 py-1.5 font-mono text-sm',
                'hover:bg-[var(--cc-surface-hover)] focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-[var(--cc-focus-ring)]',
              )}
            >
              {variant.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
