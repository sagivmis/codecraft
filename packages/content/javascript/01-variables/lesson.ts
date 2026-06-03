import { defineLesson, type Lesson } from '@codecraft/schema';

/**
 * Sample lesson used to exercise the LessonPlayer during development.
 * The five_js_lessons todo will polish this and add the other four.
 */
const variablesLesson: Lesson = defineLesson({
  id: 'js-variables',
  language: 'js',
  tier: 'easy',
  order: 0,
  concepts: ['let', 'const', 'string', 'number', 'boolean'],
  estimatedMinutes: 10,
  prerequisites: [],
  variants: {
    kids: {
      title: 'Boxes that hold stuff',
      subtitle: 'Variables are like labeled boxes that keep things for you.',
      illustration: 'mascot-box',
    },
    teens: {
      title: 'Variables and values',
      subtitle: 'Naming things so the program can remember them.',
    },
  },
  stages: {
    hook: {
      kind: 'hook',
      estimatedSeconds: 25,
      copy: 'Every game keeps your score in a variable. Every chat app keeps your username in one. They are everywhere.',
      visual: { kind: 'emoji', src: '📦', alt: 'A storage box' },
    },
    walkthrough: {
      kind: 'walkthrough',
      language: 'js',
      code: `const name = 'Sagiv';\nlet score = 0;\nscore = score + 10;\nconsole.log(name, score);`,
      steps: [
        {
          id: 's1',
          revealUpToLine: 1,
          highlights: [{ startLine: 1, endLine: 1 }],
          explanation:
            "`const` declares a variable whose value will not change. Here we save the text 'Sagiv' under the name `name`.",
        },
        {
          id: 's2',
          revealUpToLine: 2,
          highlights: [{ startLine: 2, endLine: 2 }],
          explanation:
            '`let` is used when the value will change later. We start `score` at zero.',
        },
        {
          id: 's3',
          revealUpToLine: 3,
          highlights: [{ startLine: 3, endLine: 3 }],
          explanation:
            'We change `score` by reading its current value, adding 10, and saving the result back into the same variable.',
        },
        {
          id: 's4',
          revealUpToLine: 4,
          highlights: [{ startLine: 4, endLine: 4 }],
          explanation: 'We print both variables. The console shows: Sagiv 10',
        },
      ],
      realWorldSnippet: {
        code: `const username = 'sagiv05';\nlet unreadMessages = 7;`,
        caption: 'A real chat app stores your username and unread count in variables like these.',
      },
    },
    quiz: {
      kind: 'quiz',
      questions: [
        {
          kind: 'multipleChoice',
          id: 'q1',
          prompt: 'Which keyword should you use for a value that will never change?',
          options: [
            { id: 'a', label: 'let' },
            { id: 'b', label: 'const' },
            { id: 'c', label: 'var' },
          ],
          correctOptionId: 'b',
          explanation:
            '`const` declares a constant - the binding cannot be reassigned. Use `let` for values you plan to update.',
        },
        {
          kind: 'whatPrints',
          id: 'q2',
          prompt: 'What does this code print?',
          code: `let n = 5;\nn = n + 2;\nconsole.log(n);`,
          expected: '7',
          explanation: 'We start at 5, then reassign `n` to `5 + 2`, so the final value is 7.',
        },
      ],
    },
    fixTheBug: {
      kind: 'fixTheBug',
      language: 'js',
      mode: 'edit',
      buggyCode: `const score = 0;\nscore = score + 10;\nconsole.log(score);`,
      solutionCode: `let score = 0;\nscore = score + 10;\nconsole.log(score);`,
      acceptableSolutions: [
        {
          matcher: 'normalized',
          value: `let score = 0;\nscore = score + 10;\nconsole.log(score);`,
        },
      ],
      hints: [
        'Try running it in your head. Which line tries to change a value that should not change?',
        'You cannot reassign a `const`. What keyword would let you reassign?',
        'Replace `const` with `let` on the first line.',
      ],
      postSuccessExplanation:
        '`const` makes the variable read-only. Since we wanted to update `score`, `let` is the right tool here.',
    },
    implement: {
      kind: 'implement',
      language: 'js',
      taskDescription:
        'Declare a variable `greeting` whose value is the string `"hello"`. Then declare a variable `count` whose value is the number 3.',
      starterCode: `// Declare greeting and count below\n`,
      solutionCode: `const greeting = 'hello';\nconst count = 3;\n`,
      tests: [
        {
          id: 't1',
          description: 'greeting equals "hello"',
          code: `expect(greeting).toBe('hello')`,
          failureHint: 'Make sure `greeting` is exactly the string "hello" (with lowercase letters).',
          hidden: false,
        },
        {
          id: 't2',
          description: 'count equals 3',
          code: `expect(count).toBe(3)`,
          failureHint: 'Make sure `count` is the number 3, not the string "3".',
          hidden: false,
        },
      ],
      hints: [
        'Use `const` because these values will not change.',
        'Strings go in single or double quotes. Numbers do not.',
      ],
    },
  },
  codeKeyboard: {
    lessonPalette: [
      { label: 'const', insert: 'const ', description: 'Declare an unchangeable variable' },
      { label: 'let', insert: 'let ', description: 'Declare a changeable variable' },
      { label: '=', insert: ' = ', description: 'Assignment' },
      { label: "'_'", insert: "'$0'", description: 'String quotes (cursor inside)' },
      { label: ';', insert: ';', description: 'End of statement' },
    ],
  },
});

export default variablesLesson;
