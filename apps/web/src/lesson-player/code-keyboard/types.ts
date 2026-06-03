import type { TokenSpec } from '@codecraft/schema';

/**
 * Editor-agnostic insertion interface.
 *
 * The Code Keyboard does not know whether the active editor is a plain
 * textarea or a Monaco instance; it just asks the adapter to insert text.
 * Implementations:
 *   - createTextareaAdapter(ref) for the interim textarea
 *   - createMonacoAdapter(editor) once Stage 3 upgrades to Monaco (next todo)
 */
export interface EditorAdapter {
  /** Inserts `insert` at the cursor (replacing selection if any). A literal
   *  `$0` marker in `insert` is removed and the cursor is placed there. */
  insertText(insert: string): void;
  /** Focuses the underlying editor so the soft keyboard stays up. */
  focus(): void;
}

export type { TokenSpec };
