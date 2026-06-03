import { useEffect, useState } from 'react';

/**
 * Tracks the soft keyboard's visible position via the visualViewport API.
 *
 * Returns the number of pixels from the bottom of the layout viewport to the
 * top of the soft keyboard (0 means the keyboard is closed or unsupported).
 *
 * On desktop browsers `visualViewport` exists but never differs from the
 * window viewport, so this hook returns 0 there.
 */
export function useSoftKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      /* The keyboard takes up the space below the visual viewport. */
      const next = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setOffset(next);
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('orientationchange', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return offset;
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
