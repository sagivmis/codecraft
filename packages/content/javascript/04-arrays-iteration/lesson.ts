import { defineLesson, type Lesson } from '@codecraft/schema';

const arraysLesson: Lesson = defineLesson({
  id: 'js-arrays-iteration',
  language: 'js',
  tier: 'easy',
  order: 3,
  concepts: ['array', 'length', 'index', 'for...of', '.map', '.filter'],
  estimatedMinutes: 14,
  prerequisites: ['js-variables', 'js-functions'],
  variants: {
    kids: {
      title: 'Lists, and looking at each thing in them',
      subtitle: 'A list of things, and how to do something with every one.',
      illustration: 'mascot-list',
    },
    teens: {
      title: 'Arrays and iteration',
      subtitle: 'Storing many values in order and walking through them.',
    },
  },
  stages: {
    hook: {
      kind: 'hook',
      estimatedSeconds: 25,
      copy: 'Your messages list. Your photo feed. Your playlist. Every collection of things you scroll through is an array under the hood.',
      visual: { kind: 'emoji', src: '📜', alt: 'A scroll / list' },
    },
    walkthrough: {
      kind: 'walkthrough',
      language: 'js',
      code: `const scores = [80, 95, 72, 100];\nconsole.log(scores.length);\nconsole.log(scores[0]);\nfor (const s of scores) {\n  console.log(s);\n}`,
      steps: [
        {
          id: 's1',
          revealUpToLine: 1,
          highlights: [{ startLine: 1, endLine: 1 }],
          explanation:
            'Square brackets `[ ]` create an array. We have four numbers inside, separated by commas.',
        },
        {
          id: 's2',
          revealUpToLine: 2,
          highlights: [{ startLine: 2, endLine: 2, startColumn: 13, endColumn: 26 }],
          explanation: '`.length` gives the number of items. This prints `4`.',
        },
        {
          id: 's3',
          revealUpToLine: 3,
          highlights: [{ startLine: 3, endLine: 3, startColumn: 13, endColumn: 22 }],
          explanation:
            'Square brackets with a number give you that position. Arrays start at `0`, so `[0]` is the first item: `80`.',
        },
        {
          id: 's4',
          revealUpToLine: 4,
          highlights: [{ startLine: 4, endLine: 4 }],
          explanation:
            '`for (const s of scores)` walks through every item. Each time the loop runs, `s` is the next score.',
        },
        {
          id: 's5',
          revealUpToLine: 6,
          highlights: [{ startLine: 5, endLine: 5 }],
          explanation:
            'The loop body runs four times - once for each score. It prints 80, then 95, then 72, then 100.',
        },
      ],
      realWorldSnippet: {
        code: `for (const post of feed) {\n  renderPost(post);\n}`,
        caption: 'This is how a social feed turns a list of posts into the rectangles you see on screen.',
      },
    },
    quiz: {
      kind: 'quiz',
      questions: [
        {
          kind: 'multipleChoice',
          id: 'q1',
          prompt: 'What is the FIRST index of an array?',
          options: [
            { id: 'a', label: '1' },
            { id: 'b', label: '0' },
            { id: 'c', label: '-1' },
          ],
          correctOptionId: 'b',
          explanation:
            'Arrays start at `0` in JavaScript. The first element is at index `0`, the second at `1`, and so on.',
        },
        {
          kind: 'whatPrints',
          id: 'q2',
          prompt: 'What does this print?',
          code: `const items = ['a', 'b', 'c'];\nconsole.log(items[1]);`,
          expected: 'b',
          explanation: 'Index `1` is the SECOND item because indexes start at 0.',
        },
        {
          kind: 'whatPrints',
          id: 'q3',
          prompt: 'What does this print?',
          code: `const xs = [10, 20, 30];\nlet total = 0;\nfor (const x of xs) {\n  total = total + x;\n}\nconsole.log(total);`,
          expected: '60',
          explanation:
            'The loop adds each value (10 + 20 + 30) into total, ending with 60.',
        },
      ],
    },
    fixTheBug: {
      kind: 'fixTheBug',
      language: 'js',
      mode: 'edit',
      buggyCode: `const fruits = ['apple', 'banana', 'cherry'];\nconsole.log(fruits[3]);`,
      solutionCode: `const fruits = ['apple', 'banana', 'cherry'];\nconsole.log(fruits[2]);`,
      acceptableSolutions: [
        {
          matcher: 'normalized',
          value: `const fruits = ['apple', 'banana', 'cherry'];\nconsole.log(fruits[0]);`,
          feedback: 'That works! Any valid index (0, 1, or 2) is fine - the bug was the out-of-range `3`.',
        },
        {
          matcher: 'normalized',
          value: `const fruits = ['apple', 'banana', 'cherry'];\nconsole.log(fruits[1]);`,
          feedback: 'That works! Any valid index (0, 1, or 2) is fine - the bug was the out-of-range `3`.',
        },
      ],
      hints: [
        'How many items are in `fruits`? What is the LAST valid index?',
        'Arrays start at 0. Three items means indexes 0, 1, and 2 - never 3.',
        'Change `fruits[3]` to `fruits[2]` to print the last item.',
      ],
      postSuccessExplanation:
        'The classic off-by-one. An array of length 3 has indexes 0, 1, 2. Accessing index 3 returns `undefined`.',
    },
    implement: {
      kind: 'implement',
      language: 'js',
      taskDescription:
        'Write a function `sum(numbers)` that returns the total of all the numbers in the array. `sum([])` should return 0.',
      starterCode: `function sum(numbers) {\n  // your code here\n}\n`,
      solutionCode: `function sum(numbers) {\n  let total = 0;\n  for (const n of numbers) {\n    total = total + n;\n  }\n  return total;\n}\n`,
      tests: [
        {
          id: 't1',
          description: 'sum([1, 2, 3]) is 6',
          code: `expect(sum([1, 2, 3])).toBe(6)`,
          hidden: false,
        },
        {
          id: 't2',
          description: 'sum([]) is 0',
          code: `expect(sum([])).toBe(0)`,
          failureHint: 'The empty array should give 0. Start your total at 0 before the loop.',
          hidden: false,
        },
        {
          id: 't3',
          description: 'sum([10, -5, 7]) is 12',
          code: `expect(sum([10, -5, 7])).toBe(12)`,
          hidden: false,
        },
      ],
      hints: [
        'Start with a running total set to 0.',
        'Use `for (const n of numbers)` to walk through every value.',
        'Add each `n` to the total, then return the total at the end.',
      ],
    },
  },
  codeKeyboard: {
    lessonPalette: [
      { label: '[ ]', insert: '[$0]' },
      { label: 'for...of', insert: 'for (const $0 of ) {\n  \n}' },
      { label: '.length', insert: '.length' },
      { label: '.map', insert: '.map(($0) => )' },
      { label: '.filter', insert: '.filter(($0) => )' },
    ],
  },
});

export default arraysLesson;
