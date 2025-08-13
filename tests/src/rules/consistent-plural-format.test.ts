import { rule, name } from '../../../src/rules/consistent-plural-format'
import { RuleTester } from '@typescript-eslint/rule-tester'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

ruleTester.run(name, rule, {
  valid: [
    // Default (hash) style - valid cases
    {
      code: `plural(numBooks, {
        one: "# book",
        other: "# books",
      })`,
    },
    {
      code: `plural(count, {
        zero: "# items",
        one: "# item",
        other: "# items",
      })`,
    },
    // Template style - valid cases when configured
    {
      code: `plural(numBooks, {
        one: \`\${numBooks} book\`,
        other: \`\${numBooks} books\`,
      })`,
      options: [{ style: 'template' }],
    },
    {
      code: `plural(count, {
        zero: \`\${count} items\`,
        one: \`\${count} item\`,
        other: \`\${count} items\`,
      })`,
      options: [{ style: 'template' }],
    },
    // Non-plural calls should be ignored
    {
      code: `someOtherFunction(numBooks, {
        one: \`\${numBooks} book\`,
        other: \`\${numBooks} books\`,
      })`,
    },
    // Plural calls without object literals should be ignored
    {
      code: `plural(numBooks, someVariable)`,
    },
  ],
  invalid: [
    // Hash style preferred (default), but template literals used
    {
      code: `plural(numBooks, {
        one: \`\${numBooks} book\`,
        other: \`\${numBooks} books\`,
      })`,
      errors: [
        { messageId: 'hashRequired' },
        { messageId: 'hashRequired' },
      ],
    },
    {
      code: `plural(count, {
        zero: \`\${count} items\`,
        one: "# item",
        other: \`\${count} items\`,
      })`,
      errors: [
        { messageId: 'hashRequired' },
        { messageId: 'hashRequired' },
      ],
    },
    // Template style preferred, but hash format used
    {
      code: `plural(numBooks, {
        one: "# book",
        other: "# books",
      })`,
      options: [{ style: 'template' }],
      errors: [
        { messageId: 'templateRequired' },
        { messageId: 'templateRequired' },
      ],
    },
    {
      code: `plural(count, {
        zero: "# items",
        one: \`\${count} item\`,
        other: "# items",
      })`,
      options: [{ style: 'template' }],
      errors: [
        { messageId: 'templateRequired' },
        { messageId: 'templateRequired' },
      ],
    },
    // Mixed hash and template literal patterns in strings (hash preferred)
    {
      code: `plural(numBooks, {
        one: "\${numBooks} book",
        other: "# books",
      })`,
      errors: [
        { messageId: 'hashRequired' },
      ],
    },
  ],
})
