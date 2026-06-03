import { z } from 'zod';

export const TokenSpecSchema: z.ZodType<TokenSpec> = z.lazy(() =>
  z.object({
    label: z.string().min(1),
    insert: z.string().min(1),
    description: z.string().optional(),
    variants: z.array(TokenSpecSchema).optional(),
    shortcut: z.string().optional(),
  }),
);

export type TokenSpec = {
  /** Text shown on the button, e.g. "=>" or "const". */
  label: string;
  /**
   * The text to insert at the cursor. Supports a single `$0` marker to indicate
   * the final cursor position; otherwise the cursor is placed at the end.
   * Examples:
   *   "{$0}"        -> inserts `{}` with cursor between the braces
   *   "if ($0) {\n  \n}" -> inserts an if block with cursor in the condition
   */
  insert: string;
  /** Optional short explanation rendered as a tooltip / sr-only label. */
  description?: string;
  /** Variants surfaced on long-press. */
  variants?: TokenSpec[];
  /** Optional desktop keyboard shortcut, e.g. "Alt+1". */
  shortcut?: string;
};

export const CodeKeyboardConfigSchema = z.object({
  lessonPalette: z.array(TokenSpecSchema).min(1).max(8),
  /** Optional list of base-palette labels to hide for very early lessons. */
  disableBaseTokens: z.array(z.string()).optional(),
});

export type CodeKeyboardConfig = z.infer<typeof CodeKeyboardConfigSchema>;
