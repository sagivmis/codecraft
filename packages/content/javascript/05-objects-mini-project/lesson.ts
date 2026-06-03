import { defineLesson, type Lesson } from '@codecraft/schema';

const objectsLesson: Lesson = defineLesson({
  id: 'js-objects-mini-project',
  language: 'js',
  tier: 'easy',
  order: 4,
  concepts: ['object', 'key', 'value', 'dot access', 'bracket access'],
  estimatedMinutes: 18,
  prerequisites: ['js-variables', 'js-functions', 'js-arrays-iteration'],
  variants: {
    kids: {
      title: 'Boxes with named drawers',
      subtitle: 'A bundle of related stuff - each piece has a label.',
      illustration: 'mascot-box-drawers',
    },
    teens: {
      title: 'Objects + a mini project',
      subtitle: 'Key/value pairs - the data shape that runs the web.',
    },
  },
  stages: {
    hook: {
      kind: 'hook',
      estimatedSeconds: 25,
      copy: 'Your profile - name, username, photo, follower count - that bundle of related info is an object. Every API response on the web is one.',
      visual: { kind: 'emoji', src: '🪪', alt: 'An ID card' },
    },
    walkthrough: {
      kind: 'walkthrough',
      language: 'js',
      code: `const student = {\n  name: 'Sagiv',\n  age: 14,\n  passing: true,\n};\nconsole.log(student.name);\nconsole.log(student['age']);\nstudent.age = 15;`,
      steps: [
        {
          id: 's1',
          revealUpToLine: 1,
          highlights: [{ startLine: 1, endLine: 1 }],
          explanation:
            'Curly braces `{ }` create an object. We store it in a variable called `student`.',
        },
        {
          id: 's2',
          revealUpToLine: 4,
          highlights: [{ startLine: 2, endLine: 4 }],
          explanation:
            'Each line inside is a `key: value` pair. The key is on the left, the value on the right.',
        },
        {
          id: 's3',
          revealUpToLine: 6,
          highlights: [{ startLine: 6, endLine: 6, startColumn: 13, endColumn: 25 }],
          explanation:
            '`student.name` is "dot access". It reads the value stored under the key `name`.',
        },
        {
          id: 's4',
          revealUpToLine: 7,
          highlights: [{ startLine: 7, endLine: 7, startColumn: 13, endColumn: 27 }],
          explanation:
            '`student["age"]` is "bracket access" - same idea, but the key is a string in quotes. Useful when the key has spaces or is computed.',
        },
        {
          id: 's5',
          revealUpToLine: 8,
          highlights: [{ startLine: 8, endLine: 8 }],
          explanation: 'You can change a value by assigning to it. Now `student.age` is 15.',
        },
      ],
      realWorldSnippet: {
        code: `const user = {\n  id: 42,\n  username: 'sagiv05',\n  avatarUrl: '/photos/42.jpg',\n};`,
        caption:
          'Every "user" object behind every login screen on the web looks something like this.',
      },
    },
    quiz: {
      kind: 'quiz',
      questions: [
        {
          kind: 'multipleChoice',
          id: 'q1',
          prompt: 'Which symbol creates an object?',
          options: [
            { id: 'a', label: '[ ]' },
            { id: 'b', label: '( )' },
            { id: 'c', label: '{ }' },
          ],
          correctOptionId: 'c',
          explanation:
            '`{ }` makes an object. `[ ]` makes an array. `( )` is for function calls and grouping.',
        },
        {
          kind: 'whatPrints',
          id: 'q2',
          prompt: 'What does this print?',
          code: `const dog = { name: 'Rex', age: 3 };\nconsole.log(dog.name);`,
          expected: 'Rex',
          explanation: '`dog.name` reads the value stored under the key `name`.',
        },
        {
          kind: 'whatPrints',
          id: 'q3',
          prompt: 'What does this print?',
          code: `const car = { color: 'red' };\ncar.color = 'blue';\nconsole.log(car.color);`,
          expected: 'blue',
          explanation:
            'We change the value of `color` from "red" to "blue", so the log shows the new value.',
        },
      ],
    },
    fixTheBug: {
      kind: 'fixTheBug',
      language: 'js',
      mode: 'edit',
      buggyCode: `const book = {\n  title: 'Hobbit',\n  pages: 300,\n};\nconsole.log(book.titel);`,
      solutionCode: `const book = {\n  title: 'Hobbit',\n  pages: 300,\n};\nconsole.log(book.title);`,
      acceptableSolutions: [
        {
          matcher: 'normalized',
          value: `const book = {\n  title: 'Hobbit',\n  pages: 300,\n};\nconsole.log(book['title']);`,
        },
      ],
      hints: [
        'Run the code in your head. The console will print `undefined` - that means JavaScript could not find what you asked for.',
        'Compare the keys defined in the object with the key you are reading from. They are not spelled the same.',
        'Change `book.titel` to `book.title`.',
      ],
      postSuccessExplanation:
        'Accessing a key that does not exist returns `undefined` - JavaScript does not crash, it just gives you nothing. Always double-check the spelling.',
    },
    implement: {
      kind: 'implement',
      language: 'js',
      taskDescription:
        'Write a function `greet(person)` that takes a person object with `name` and `age` properties and returns a string like "Hi, my name is Sagiv and I am 14".',
      starterCode: `function greet(person) {\n  // your code here\n}\n`,
      solutionCode: `function greet(person) {\n  return 'Hi, my name is ' + person.name + ' and I am ' + person.age;\n}\n`,
      tests: [
        {
          id: 't1',
          description: 'works for Sagiv, 14',
          code: `expect(greet({ name: 'Sagiv', age: 14 })).toBe('Hi, my name is Sagiv and I am 14')`,
          hidden: false,
        },
        {
          id: 't2',
          description: 'works for Maya, 9',
          code: `expect(greet({ name: 'Maya', age: 9 })).toBe('Hi, my name is Maya and I am 9')`,
          hidden: false,
        },
        {
          id: 't3',
          description: 'reads from the object, not from globals',
          code: `let name = 'WRONG'; let age = 99; expect(greet({ name: 'Lia', age: 11 })).toBe('Hi, my name is Lia and I am 11')`,
          failureHint:
            'Make sure you use `person.name` and `person.age` - not a bare `name` or `age` variable.',
          hidden: false,
        },
      ],
      hints: [
        'Use `person.name` and `person.age` inside the function.',
        'Build the result string with `+` to glue pieces together.',
        '`return "Hi, my name is " + person.name + " and I am " + person.age` does it.',
      ],
    },
  },
  codeKeyboard: {
    lessonPalette: [
      { label: '{ }', insert: '{$0}' },
      { label: ':', insert: ': ' },
      { label: ',', insert: ',\n  ' },
      { label: '.', insert: '.' },
      { label: 'return', insert: 'return ' },
    ],
  },
});

export default objectsLesson;
