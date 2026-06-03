import { useCallback, useEffect, useMemo, useRef } from 'react';
import Editor, { useMonaco, type OnMount } from '@monaco-editor/react';
import type { editor as monacoEditor } from 'monaco-editor';
import { cn } from '@codecraft/ui';
import type { Language } from '@codecraft/schema';

import type { EditorAdapter } from '../code-keyboard/types.js';

type MonacoEditorProps = {
  value: string;
  onChange: (next: string) => void;
  language: Language;
  /** Called once with an adapter the CodeKeyboard can drive. */
  onAdapter?: (adapter: EditorAdapter | null) => void;
  /** Optional height. Defaults to ~10 lines. */
  heightLines?: number;
  /** If true, the editor is read-only (e.g. solution preview). */
  readOnly?: boolean;
};

/* Monaco's language id differs slightly from ours. */
const LANGUAGE_MAP: Record<Language, string> = {
  js: 'javascript',
  ts: 'typescript',
  python: 'python',
  csharp: 'csharp',
};

/* Cap the editor height so a lesson with a long starter still fits the
 * viewport on mobile. Min height keeps the cursor reachable on the
 * smallest screens. */
const LINE_HEIGHT_PX = 22;
const MIN_HEIGHT_PX = 160;
const MAX_HEIGHT_PX = 480;

export function MonacoEditor({
  value,
  onChange,
  language,
  onAdapter,
  heightLines = 10,
  readOnly = false,
}: MonacoEditorProps) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const monaco = useMonaco();

  /* Register both light and dark themes on first mount so the CodeBlock
   * aesthetic matches the rest of the app. */
  useEffect(() => {
    if (!monaco) return;
    monaco.editor.defineTheme('codecraft-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#0b1020',
        'editor.foreground': '#e2e8f0',
        'editorLineNumber.foreground': '#475569',
        'editor.selectionBackground': '#4f46e544',
        'editor.lineHighlightBackground': '#1f293744',
      },
    });
    monaco.editor.setTheme('codecraft-dark');
  }, [monaco]);

  const handleMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;

      const adapter: EditorAdapter = {
        insertText(insert: string) {
          const cursorMarker = '$0';
          const markerIdx = insert.indexOf(cursorMarker);
          const cleaned = markerIdx === -1 ? insert : insert.replace(cursorMarker, '');

          const selection = editor.getSelection();
          if (!selection) return;

          editor.executeEdits('code-keyboard', [
            {
              range: selection,
              text: cleaned,
              forceMoveMarkers: true,
            },
          ]);

          /* If a $0 marker existed, walk the cursor back to that offset. */
          if (markerIdx !== -1) {
            const model = editor.getModel();
            if (model) {
              /* Convert offset within `cleaned` to a position. We compute
               * absolute offset from the start of the document, then ask
               * Monaco for the matching (line, column). */
              const startOffset = model.getOffsetAt({
                lineNumber: selection.startLineNumber,
                column: selection.startColumn,
              });
              const newPos = model.getPositionAt(startOffset + markerIdx);
              editor.setPosition(newPos);
            }
          }
        },
        focus() {
          editor.focus();
        },
      };

      onAdapter?.(adapter);
    },
    [onAdapter],
  );

  useEffect(() => () => onAdapter?.(null), [onAdapter]);

  const height = useMemo(() => {
    const px = heightLines * LINE_HEIGHT_PX + 24;
    return Math.max(MIN_HEIGHT_PX, Math.min(MAX_HEIGHT_PX, px));
  }, [heightLines]);

  const options: monacoEditor.IStandaloneEditorConstructionOptions = useMemo(
    () => ({
      minimap: { enabled: false },
      fontFamily: "var(--cc-font-mono), 'JetBrains Mono', monospace",
      fontSize: 14,
      lineHeight: LINE_HEIGHT_PX,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: 'gutter',
      cursorBlinking: 'smooth',
      smoothScrolling: true,
      scrollbar: { vertical: 'auto', horizontal: 'auto', useShadows: false },
      readOnly,
      /* Mobile UX: hide noisy hover popups, suggestion widgets, and the
       * sticky scroll header so the small screen is not overwhelmed. */
      hover: { enabled: false },
      quickSuggestions: false,
      suggestOnTriggerCharacters: false,
      stickyScroll: { enabled: false },
      occurrencesHighlight: 'off',
      selectionHighlight: false,
      contextmenu: false,
      /* Prevent native pinch-zoom-into-text on iOS. */
      mouseWheelZoom: false,
    }),
    [readOnly],
  );

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-[var(--cc-border)] bg-[var(--cc-code-bg)]',
        'focus-within:ring-2 focus-within:ring-[var(--cc-focus-ring)]',
      )}
    >
      <Editor
        value={value}
        onChange={(next) => onChange(next ?? '')}
        language={LANGUAGE_MAP[language]}
        height={`${height}px`}
        theme="codecraft-dark"
        options={options}
        onMount={handleMount}
        loading={
          <div className="flex h-40 items-center justify-center text-sm text-[var(--cc-fg-muted)]">
            Loading editor…
          </div>
        }
      />
    </div>
  );
}
