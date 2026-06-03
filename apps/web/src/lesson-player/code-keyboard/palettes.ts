import type { Language, TokenSpec } from '@codecraft/schema';

/**
 * Always-present palette of language-agnostic tokens that students of any
 * language will need a lot of. Order matters: most-used first.
 */
export const BASE_PALETTE: TokenSpec[] = [
  { label: '{ }', insert: '{$0}', description: 'Open and close braces' },
  { label: '( )', insert: '($0)', description: 'Parentheses' },
  { label: '[ ]', insert: '[$0]', description: 'Square brackets' },
  { label: '"_"', insert: '"$0"', description: 'Double-quoted string' },
  { label: "'_'", insert: "'$0'", description: 'Single-quoted string' },
  { label: ';', insert: ';', description: 'End of statement' },
  { label: ',', insert: ', ', description: 'Comma separator' },
  { label: '.', insert: '.', description: 'Property access' },
  { label: ':', insert: ': ', description: 'Colon (key/value, type)' },
  { label: '=', insert: ' = ', description: 'Assignment' },
  { label: '==', insert: ' == ', description: 'Loose equality' },
  { label: '===', insert: ' === ', description: 'Strict equality' },
  { label: '=>', insert: ' => ', description: 'Arrow function' },
  { label: '<', insert: ' < ', description: 'Less-than' },
  { label: '>', insert: ' > ', description: 'Greater-than' },
];

/**
 * Per-language tokens layered on top of the base palette.
 * These are the "keywords every learner reaches for in this language."
 */
export const LANGUAGE_PALETTES: Record<Language, TokenSpec[]> = {
  js: [
    { label: 'const', insert: 'const ', description: 'Constant binding' },
    { label: 'let', insert: 'let ', description: 'Reassignable binding' },
    {
      label: 'function',
      insert: 'function $0() {\n  \n}',
      description: 'Function declaration',
    },
    { label: 'return', insert: 'return ', description: 'Return from a function' },
    {
      label: 'if',
      insert: 'if ($0) {\n  \n}',
      description: 'Conditional',
      variants: [
        { label: 'else', insert: ' else {\n  $0\n}' },
        { label: 'else if', insert: ' else if ($0) {\n  \n}' },
      ],
    },
    {
      label: 'for',
      insert: 'for (let i = 0; i < $0; i++) {\n  \n}',
      description: 'Counted loop',
    },
    { label: 'true', insert: 'true' },
    { label: 'false', insert: 'false' },
    { label: 'null', insert: 'null' },
    { label: 'console.log', insert: 'console.log($0)', description: 'Print to console' },
  ],
  ts: [
    { label: 'const', insert: 'const ' },
    { label: 'let', insert: 'let ' },
    { label: ': string', insert: ': string' },
    { label: ': number', insert: ': number' },
    { label: ': boolean', insert: ': boolean' },
    {
      label: 'interface',
      insert: 'interface $0 {\n  \n}',
      description: 'Interface declaration',
    },
    { label: 'type', insert: 'type $0 = ', description: 'Type alias' },
    {
      label: 'function',
      insert: 'function $0(): void {\n  \n}',
      description: 'Function declaration',
    },
    { label: 'return', insert: 'return ' },
    { label: 'true', insert: 'true' },
    { label: 'false', insert: 'false' },
    { label: 'console.log', insert: 'console.log($0)' },
  ],
  python: [
    { label: 'def', insert: 'def $0():\n    ' },
    { label: 'return', insert: 'return ' },
    { label: 'if', insert: 'if $0:\n    ' },
    { label: 'else', insert: 'else:\n    $0' },
    { label: 'for', insert: 'for $0 in :\n    ' },
    { label: 'True', insert: 'True' },
    { label: 'False', insert: 'False' },
    { label: 'None', insert: 'None' },
    { label: 'print', insert: 'print($0)' },
  ],
  csharp: [
    { label: 'var', insert: 'var ' },
    { label: 'int', insert: 'int ' },
    { label: 'string', insert: 'string ' },
    { label: 'bool', insert: 'bool ' },
    { label: 'return', insert: 'return ' },
    { label: 'if', insert: 'if ($0)\n{\n    \n}' },
    { label: 'for', insert: 'for (int i = 0; i < $0; i++)\n{\n    \n}' },
    { label: 'true', insert: 'true' },
    { label: 'false', insert: 'false' },
    { label: 'null', insert: 'null' },
    { label: 'Console.WriteLine', insert: 'Console.WriteLine($0)' },
  ],
};

export type ResolvedPalette = {
  lesson: TokenSpec[];
  language: TokenSpec[];
  base: TokenSpec[];
};

/**
 * Tier the palettes (lesson, language, base). Duplicate labels in a lower
 * tier are dropped so a lesson can override a default token by re-declaring
 * it with the same label.
 *
 * Order is preserved within each tier.
 */
export function resolvePalette({
  language,
  lessonPalette,
  disableBaseTokens,
}: {
  language: Language;
  lessonPalette?: TokenSpec[];
  disableBaseTokens?: string[];
}): ResolvedPalette {
  const lesson = lessonPalette ?? [];
  const lessonLabels = new Set(lesson.map((t) => t.label));

  const lang = (LANGUAGE_PALETTES[language] ?? []).filter((t) => !lessonLabels.has(t.label));
  const langLabels = new Set(lang.map((t) => t.label));

  const base = BASE_PALETTE.filter(
    (t) =>
      !lessonLabels.has(t.label) &&
      !langLabels.has(t.label) &&
      !disableBaseTokens?.includes(t.label),
  );

  return { lesson, language: lang, base };
}
