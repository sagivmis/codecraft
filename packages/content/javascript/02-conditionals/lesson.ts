import { defineLesson, type Lesson } from '@codecraft/schema';

const conditionalsLesson: Lesson = defineLesson({
  id: 'js-conditionals',
  language: 'js',
  tier: 'easy',
  order: 1,
  concepts: ['if', 'else', 'else if', '===', '<', '>', '&&', '||'],
  estimatedMinutes: 12,
  prerequisites: ['js-variables'],
  variants: {
    kids: {
      title: 'Asking your code questions',
      subtitle: 'Make different things happen depending on what is true.',
      illustration: 'mascot-question',
    },
    teens: {
      title: 'Conditionals',
      subtitle: 'Branching logic with if / else and comparison operators.',
    },
  },
  stages: {
    hook: {
      kind: 'hook',
      estimatedSeconds: 25,
      copy: 'Every time you see "Only humans can enter" or "Adults only" - that is a conditional. Your code reads a value and chooses a path.',
      visual: { kind: 'emoji', src: '🔀', alt: 'A branching arrow' },
    },
    walkthrough: {
      kind: 'walkthrough',
      language: 'js',
      code: `const age = 14;\nif (age >= 13) {\n  console.log('You can enter');\n} else {\n  console.log('Sorry, not yet');\n}`,
      steps: [
        {
          id: 's1',
          revealUpToLine: 1,
          highlights: [{ startLine: 1, endLine: 1 }],
          explanation: 'We start with a variable that holds an age.',
        },
        {
          id: 's2',
          revealUpToLine: 2,
          highlights: [{ startLine: 2, endLine: 2, startColumn: 5, endColumn: 14 }],
          explanation:
            '`if` asks a yes/no question. The condition `age >= 13` is true when age is 13 or more.',
        },
        {
          id: 's3',
          revealUpToLine: 3,
          highlights: [{ startLine: 3, endLine: 3 }],
          explanation: 'If the condition was true, this line runs.',
        },
        {
          id: 's4',
          revealUpToLine: 5,
          highlights: [{ startLine: 4, endLine: 6 }],
          explanation: '`else` says "if the condition was false, do this instead".',
        },
        {
          id: 's5',
          revealUpToLine: 6,
          highlights: [{ startLine: 5, endLine: 5 }],
          explanation: 'Because 14 is greater than 13, this code prints "You can enter".',
        },
      ],
      realWorldSnippet: {
        code: `if (user.subscribed) {\n  showContent();\n} else {\n  showPaywall();\n}`,
        caption: 'Every paywall, every "are you logged in?" check is one of these.',
      },
    },
    quiz: {
      kind: 'quiz',
      questions: [
        {
          kind: 'multipleChoice',
          id: 'q1',
          prompt: 'Which operator means "strictly equal"?',
          options: [
            { id: 'a', label: '=' },
            { id: 'b', label: '==' },
            { id: 'c', label: '===' },
          ],
          correctOptionId: 'c',
          explanation:
            'A single `=` is assignment. `==` is loose equality (coerces types). `===` checks value AND type - what you almost always want.',
        },
        {
          kind: 'whatPrints',
          id: 'q2',
          prompt: 'What does this print?',
          code: `const n = 5;\nif (n > 10) {\n  console.log('big');\n} else {\n  console.log('small');\n}`,
          expected: 'small',
          explanation: '5 is not greater than 10, so the else branch runs.',
        },
        {
          kind: 'multipleChoice',
          id: 'q3',
          prompt: 'What does `true && false` evaluate to?',
          options: [
            { id: 'a', label: 'true' },
            { id: 'b', label: 'false' },
            { id: 'c', label: 'an error' },
          ],
          correctOptionId: 'b',
          explanation: '`&&` (AND) is only true when BOTH sides are true. Since one is false, the whole thing is false.',
        },
      ],
    },
    fixTheBug: {
      kind: 'fixTheBug',
      language: 'js',
      mode: 'edit',
      buggyCode: `const score = 85;\nif (score = 100) {\n  console.log('Perfect!');\n} else {\n  console.log('Keep practicing');\n}`,
      solutionCode: `const score = 85;\nif (score === 100) {\n  console.log('Perfect!');\n} else {\n  console.log('Keep practicing');\n}`,
      acceptableSolutions: [
        {
          matcher: 'normalized',
          value: `const score = 85;\nif (score == 100) {\n  console.log('Perfect!');\n} else {\n  console.log('Keep practicing');\n}`,
          feedback: '`==` works here, but `===` is the safer habit - it also checks the type.',
        },
      ],
      hints: [
        'Try running it in your head. What does `score = 100` actually do?',
        '`=` is assignment, not comparison. It sets score to 100 every time.',
        'You want to compare. Use `===` instead of `=`.',
      ],
      postSuccessExplanation:
        'A classic mistake. `score = 100` sets the value, which then evaluates as truthy. `===` is the comparison.',
    },
    implement: {
      kind: 'implement',
      language: 'js',
      taskDescription:
        'Write a function `canVote(age)` that returns the string "yes" if age is 18 or more, and "no" otherwise.',
      starterCode: `function canVote(age) {\n  // your code here\n}\n`,
      solutionCode: `function canVote(age) {\n  if (age >= 18) {\n    return 'yes';\n  }\n  return 'no';\n}\n`,
      tests: [
        {
          id: 't1',
          description: 'canVote(20) is "yes"',
          code: `expect(canVote(20)).toBe('yes')`,
          failureHint: 'Anyone 18 or older should get "yes".',
          hidden: false,
        },
        {
          id: 't2',
          description: 'canVote(17) is "no"',
          code: `expect(canVote(17)).toBe('no')`,
          failureHint: 'Under 18 should get "no".',
          hidden: false,
        },
        {
          id: 't3',
          description: 'canVote(18) is "yes" (boundary)',
          code: `expect(canVote(18)).toBe('yes')`,
          failureHint:
            'Watch the boundary. 18 should be "yes" - use >= not >.',
          hidden: false,
        },
      ],
      hints: [
        'Compare the age with 18 inside an `if` statement.',
        'Use `>=` so that exactly 18 also counts.',
        'Return the string "yes" or "no" - lowercase, with quotes.',
      ],
    },
  },
  codeKeyboard: {
    lessonPalette: [
      { label: 'if', insert: 'if ($0) {\n  \n}' },
      { label: 'else', insert: ' else {\n  $0\n}' },
      { label: '===', insert: ' === ' },
      { label: '>=', insert: ' >= ' },
      { label: '<=', insert: ' <= ' },
      { label: '&&', insert: ' && ' },
      { label: '||', insert: ' || ' },
    ],
  },
});

export default conditionalsLesson;
