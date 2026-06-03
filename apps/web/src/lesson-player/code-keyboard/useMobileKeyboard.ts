import { useEffect, useState } from 'react';

export type SoftKeyboardState = {
  /** Pixels from the bottom of the layout viewport to the top of the soft keyboard. */
  offsetFromBottom: number;
  /**
   * Pixels the visual viewport has scrolled away from the layout viewport top.
   * Apply this as a positive translateY to keep a `position: fixed; top: 0`
   * element visually pinned to the top of the visible area on iOS Safari.
   */
  visualOffsetTop: number;
  /** True if the soft keyboard is currently visible. */
  open: boolean;
};

/**
 * Tracks the soft keyboard's visible position via the visualViewport API.
 *
 * Why this is more complicated than a single resize listener:
 *   - iOS Safari fires `visualViewport.resize` while the keyboard animates
 *     in, but the final `offsetTop` isn't settled until ~250 ms later. If
 *     we only update on resize, we capture an intermediate state and the
 *     Code Keyboard renders below the screen.
 *   - Monaco creates an internal textarea that receives focus when tapped;
 *     that focus triggers the soft keyboard, but the `focus` event on
 *     `window` only fires once via capture. We listen on the capture phase
 *     so we don't miss it.
 *   - When the focus moves OUT of an editable, Android and iOS handle the
 *     keyboard close on slightly different timelines.
 *
 * So we update on every relevant event AND schedule three deferred reads
 * (rAF, +100ms, +300ms) after every focus change. Cheap, robust.
 */
export function useSoftKeyboard(): SoftKeyboardState {
  const [state, setState] = useState<SoftKeyboardState>({
    offsetFromBottom: 0,
    visualOffsetTop: 0,
    open: false,
  });

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    let raf = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const read = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      const visualOffsetTop = vv.offsetTop;
      /* Treat any offset > 100px as the keyboard being open (filters out
       * browser UI chrome differences). */
      const open = offset > 100;
      setState((prev) =>
        prev.offsetFromBottom === offset && prev.open === open && prev.visualOffsetTop === visualOffsetTop
          ? prev
          : { offsetFromBottom: offset, visualOffsetTop, open },
      );
    };

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(read);
    };

    const scheduleDeferredReads = () => {
      timeouts.push(setTimeout(update, 100));
      timeouts.push(setTimeout(update, 300));
      timeouts.push(setTimeout(update, 600));
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isEditable =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
      if (!isEditable) return;
      update();
      scheduleDeferredReads();
    };

    const onFocusOut = () => {
      update();
      scheduleDeferredReads();
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('orientationchange', update);
    /* Capture phase: Monaco's inner textarea sometimes stops propagation. */
    window.addEventListener('focusin', onFocusIn, true);
    window.addEventListener('focusout', onFocusOut, true);

    read();
    return () => {
      cancelAnimationFrame(raf);
      timeouts.forEach(clearTimeout);
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', update);
      window.removeEventListener('focusin', onFocusIn, true);
      window.removeEventListener('focusout', onFocusOut, true);
    };
  }, []);

  return state;
}

/**
 * @deprecated Use {@link useSoftKeyboard}. Kept for backwards compatibility.
 */
export function useSoftKeyboardOffset(): number {
  return useSoftKeyboard().offsetFromBottom;
}

/**
 * True when the device has a coarse pointer (touch-first phones / tablets).
 * Used to decide whether the Code Keyboard pins to the bottom (mobile) or
 * floats inline (desktop).
 */
export function useIsTouchDevice(): boolean {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setTouch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return touch;
}
