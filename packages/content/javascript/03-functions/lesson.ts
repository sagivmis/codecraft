import { defineLesson, type Lesson } from '@codecraft/schema';

const functionsLesson: Lesson = defineLesson({
  id: 'js-functions',
  language: 'js',
  tier: 'easy',
  order: 2,
  concepts: ['function', 'parameter', 'return', 'argument'],
  estimatedMinutes: 12,
  prerequisites: ['js-variables'],
  variants: {
    kids: {
      title: 'Magic boxes that do work',
      subtitle: 'Give them something, they give something back.',
      illustration: 'mascot-machine',
    },
    teens: {
      title: 'Functions',
      subtitle: 'Reusable blocks of logic with inputs and an output.',
    },
  },
  stages: {
    hook: {
      kind: 'hook',
      estimatedSeconds: 25,
      copy: 'Every time you tap a button and something happens - a function ran. Functions are how code is organized into reusable pieces.',
      visual: { kind: 'emoji', src: '🛠️', alt: 'A tool / function box' },
    },
    walkthrough: {
      kind: 'walkthrough',
      language: 'js',
      code: `function double(n) {\n  return n * 2;\n}\n\nconst result = double(5);\nconsole.log(result);`,
      steps: [
        {
          id: 's1',
          revealUpToLine: 1,
          highlights: [{ startLine: 1, endLine: 1 }],
          explanation:
            '`function double(n)` declares a function named `double` that takes one input called `n`.',
        },
        {
          id: 's2',
          revealUpToLine: 2,
          highlights: [{ startLine: 2, endLine: 2 }],
          explanation:
            '`return` is the function\'s output. Whatever follows `return` is what the function "gives back".',
        },
        {
          id: 's3',
          revealUpToLine: 3,
          highlights: [{ startLine: 3, endLine: 3 }],
          explanation: 'The closing brace ends the function body. The function is defined but has not yet been called.',
        },
        {
          id: 's4',
          revealUpToLine: 5,
          highlights: [{ startLine: 5, endLine: 5, startColumn: 16, endColumn: 25 }],
          explanation:
            '`double(5)` calls the function with 5 as its argument. Inside, `n` becomes 5, so the function returns 10.',
        },
        {
          id: 's5',
          revealUpToLine: 6,
          highlights: [{ startLine: 6, endLine: 6 }],
          explanation: 'We log `result`, which is 10.',
        },
      ],
      realWorldSnippet: {
        code: `function formatPrice(amount) {\n  return '$' + amount.toFixed(2);\n}`,
        caption: 'Every "$5.99" on an online store ran through a function like this.',
      },
    },
    quiz: {
      kind: 'quiz',
      questions: [
        {
          kind: 'multipleChoice',
          id: 'q1',
          prompt: 'What keyword sends a value back out of a function?',
          options: [
            { id: 'a', label: 'send' },
            { id: 'b', label: 'return' },
            { id: 'c', label: 'exit' },
          ],
          correctOptionId: 'b',
          explanation: '`return` is how a function gives its result to whoever called it.',
        },
        {
          kind: 'whatPrints',
          id: 'q2',
          prompt: 'What does this print?',
          code: `function greet(name) {\n  return 'Hi, ' + name;\n}\nconsole.log(greet('Sam'));`,
          expected: 'Hi, Sam',
          explanation: 'We call `greet` with the argument "Sam", which gets concatenated and returned.',
        },
      ],
    },
    fixTheBug: {
      kind: 'fixTheBug',
      language: 'js',
      mode: 'edit',
      buggyCode: `function square(n) {\n  n * n;\n}\nconsole.log(square(4));`,
      solutionCode: `function square(n) {\n  return n * n;\n}\nconsole.log(square(4));`,
      acceptableSolutions: [],
      hints: [
        'Look at the function body. What does it compute, and what does it actually send back?',
        'The expression `n * n` is calculated but never returned.',
        'Add `return` in front of `n * n`.',
      ],
      postSuccessExplanation:
        'Without `return`, a function gives back `undefined` by default. Add `return` to send the value out.',
    },
    implement: {
      kind: 'implement',
      language: 'js',
      taskDescription:
        'Write a function `add(a, b)` that returns the sum of the two numbers it is given.',
      starterCode: `function add(a, b) {\n  // your code here\n}\n`,
      solutionCode: `function add(a, b) {\n  return a + b;\n}\n`,
      tests: [
        {
          id: 't1',
          description: 'add(2, 3) is 5',
          code: `expect(add(2, 3)).toBe(5)`,
          hidden: false,
        },
        {
          id: 't2',
          description: 'add(10, 20) is 30',
          code: `expect(add(10, 20)).toBe(30)`,
          hidden: false,
        },
        {
          id: 't3',
          description: 'add(-1, 1) is 0',
          code: `expect(add(-1, 1)).toBe(0)`,
          failureHint: 'Make sure your function works with negative numbers too.',
          hidden: false,
        },
      ],
      hints: [
        'Use `return` to send a value back.',
        'The `+` operator adds numbers together.',
        '`return a + b` is the whole body you need.',
      ],
    },
  },
  codeKeyboard: {
    lessonPalette: [
      { label: 'function', insert: 'function $0() {\n  \n}' },
      { label: 'return', insert: 'return ' },
      { label: '( )', insert: '($0)' },
      { label: '+', insert: ' + ' },
      { label: '*', insert: ' * ' },
    ],
  },
});

export default functionsLesson;
