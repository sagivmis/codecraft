import type { RefObject } from 'react';
import type { EditorAdapter } from './types.js';

/**
 * Adapter that drives a plain <textarea>. Used by the interim Stage 3 UI;
 * will be replaced by createMonacoAdapter() in the upcoming implement_stage todo.
 *
 * Critically, this also fires a synthetic `input` event so React's controlled
 * textarea picks up the change via its onChange handler. We rely on the
 * `setValue` trick to bypass React's input value setter cache.
 */
export function createTextareaAdapter(ref: RefObject<HTMLTextAreaElement | null>): EditorAdapter {
  function applyInsert(insert: string): void {
    const ta = ref.current;
    if (!ta) return;

    const cursorMarker = '$0';
    const markerIdx = insert.indexOf(cursorMarker);
    const cleaned = markerIdx === -1 ? insert : insert.replace(cursorMarker, '');
    const cursorOffsetInInsert = markerIdx === -1 ? cleaned.length : markerIdx;

    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    const next = before + cleaned + after;

    setNativeValue(ta, next);
    /* Fire `input` so React picks up the change through its onChange. */
    ta.dispatchEvent(new Event('input', { bubbles: true }));

    const cursorPos = before.length + cursorOffsetInInsert;
    ta.selectionStart = cursorPos;
    ta.selectionEnd = cursorPos;
  }

  return {
    insertText: applyInsert,
    focus: () => ref.current?.focus(),
  };
}

/**
 * Bypass React's value-setter cache. Without this, setting `.value` directly
 * on an input that React controls is a no-op as far as React's internals are
 * concerned. Dispatching `input` afterwards is what makes React notice.
 */
function setNativeValue(el: HTMLTextAreaElement | HTMLInputElement, value: string): void {
  const proto =
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  const setter = descriptor?.set;
  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }
}
