import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, cn } from '@codecraft/ui';
import type { QuizQuestion, QuizStage } from '@codecraft/schema';

type QuizProps = {
  quiz: QuizStage;
  /** Called when every question has been answered (with the score). */
  onComplete: (result: { correct: number; total: number }) => void;
};

type AnswerState = {
  /** The student's selected answer (option id for MC, raw string for whatPrints). */
  value: string;
  isCorrect: boolean;
};

export function Quiz({ quiz, onComplete }: QuizProps) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});

  const total = quiz.questions.length;
  const question = quiz.questions[idx];
  const answered = question ? answers[question.id] : undefined;
  const allAnswered = quiz.questions.every((q) => answers[q.id]);
  const correct = useMemo(
    () => Object.values(answers).filter((a) => a.isCorrect).length,
    [answers],
  );

  if (!question) return null;

  const submit = (value: string) => {
    const isCorrect = checkAnswer(question, value);
    setAnswers((prev) => ({ ...prev, [question.id]: { value, isCorrect } }));
  };

  const next = () => {
    if (idx < total - 1) {
      setIdx(idx + 1);
    } else {
      onComplete({ correct, total });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-[var(--cc-fg-muted)]">
        <span>
          Question {idx + 1} of {total}
        </span>
        <span className="font-mono">
          {correct} / {total} correct so far
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <QuestionView question={question} answer={answered} onSubmit={submit} />
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={idx === 0}
          onClick={() => setIdx(idx - 1)}
        >
          ← Prev
        </Button>
        <div className="flex-1" />
        <Button
          variant="primary"
          size="md"
          disabled={!answered}
          onClick={next}
        >
          {idx === total - 1
            ? allAnswered
              ? 'Finish quiz'
              : 'Next →'
            : 'Next →'}
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function QuestionView({
  question,
  answer,
  onSubmit,
}: {
  question: QuizQuestion;
  answer: AnswerState | undefined;
  onSubmit: (value: string) => void;
}) {
  if (question.kind === 'multipleChoice') {
    return <MultipleChoiceView question={question} answer={answer} onSubmit={onSubmit} />;
  }
  return <WhatPrintsView question={question} answer={answer} onSubmit={onSubmit} />;
}

function MultipleChoiceView({
  question,
  answer,
  onSubmit,
}: {
  question: Extract<QuizQuestion, { kind: 'multipleChoice' }>;
  answer: AnswerState | undefined;
  onSubmit: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-medium">{question.prompt}</p>
      {question.code && (
        <pre className="overflow-x-auto rounded-lg bg-[var(--cc-code-bg)] p-3 font-mono text-sm text-[var(--cc-code-fg)]">
          {question.code}
        </pre>
      )}
      <ul className="grid gap-2" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((opt) => {
          const isSelected = answer?.value === opt.id;
          const isCorrect = question.correctOptionId === opt.id;
          const revealOutcome = !!answer;
          return (
            <li key={opt.id}>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!!answer}
                onClick={() => onSubmit(opt.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors',
                  'border-[var(--cc-border)] bg-[var(--cc-surface)]',
                  !answer && 'hover:bg-[var(--cc-surface-hover)]',
                  revealOutcome && isCorrect && 'border-[var(--cc-success)] bg-[var(--cc-success)]/10',
                  revealOutcome && isSelected && !isCorrect &&
                    'border-[var(--cc-danger)] bg-[var(--cc-danger)]/10',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                    isSelected
                      ? 'border-[var(--cc-primary)] bg-[var(--cc-primary)] text-[var(--cc-primary-fg)]'
                      : 'border-[var(--cc-border)] text-[var(--cc-fg-muted)]',
                    revealOutcome && isCorrect && 'border-[var(--cc-success)] bg-[var(--cc-success)] text-white',
                  )}
                >
                  {revealOutcome && isCorrect ? '✓' : isSelected ? '●' : ''}
                </span>
                <span className="text-base">{opt.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {answer && <FeedbackBox isCorrect={answer.isCorrect} explanation={question.explanation} />}
      </AnimatePresence>
    </div>
  );
}

function WhatPrintsView({
  question,
  answer,
  onSubmit,
}: {
  question: Extract<QuizQuestion, { kind: 'whatPrints' }>;
  answer: AnswerState | undefined;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(answer?.value ?? '');
  const disabled = !!answer;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg font-medium">{question.prompt}</p>
      <pre className="overflow-x-auto rounded-lg bg-[var(--cc-code-bg)] p-3 font-mono text-sm text-[var(--cc-code-fg)]">
        {question.code}
      </pre>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled && value.trim()) onSubmit(value.trim());
        }}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <label htmlFor="what-prints-input" className="sr-only">
          Your answer
        </label>
        <input
          id="what-prints-input"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={disabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type the output exactly..."
          className={cn(
            'flex-1 rounded-lg border bg-[var(--cc-surface)] px-3 py-2 font-mono text-base',
            'border-[var(--cc-border)] focus:outline-none focus:ring-2 focus:ring-[var(--cc-focus-ring)]',
            'disabled:cursor-not-allowed disabled:opacity-70',
            answer && answer.isCorrect && 'border-[var(--cc-success)]',
            answer && !answer.isCorrect && 'border-[var(--cc-danger)]',
          )}
        />
        <Button type="submit" variant="primary" size="md" disabled={disabled || !value.trim()}>
          Check
        </Button>
      </form>
      <AnimatePresence>
        {answer && (
          <FeedbackBox
            isCorrect={answer.isCorrect}
            explanation={question.explanation}
            extra={
              !answer.isCorrect ? (
                <p className="mt-1 text-sm text-[var(--cc-fg-muted)]">
                  Expected: <span className="font-mono">{question.expected}</span>
                </p>
              ) : undefined
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FeedbackBox({
  isCorrect,
  explanation,
  extra,
}: {
  isCorrect: boolean;
  explanation: string;
  extra?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-lg border p-3 text-sm',
        isCorrect
          ? 'border-[var(--cc-success)] bg-[var(--cc-success)]/10'
          : 'border-[var(--cc-danger)] bg-[var(--cc-danger)]/10',
      )}
      role="status"
      aria-live="polite"
    >
      <p className="font-semibold">{isCorrect ? 'Nice, that is correct.' : 'Not quite.'}</p>
      <p className="mt-1 text-[var(--cc-fg)]">{explanation}</p>
      {extra}
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */

function checkAnswer(question: QuizQuestion, value: string): boolean {
  if (question.kind === 'multipleChoice') {
    return value === question.correctOptionId;
  }
  return normalize(value) === normalize(question.expected);
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
