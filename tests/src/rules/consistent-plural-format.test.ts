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
    // Hash style OK with template string as long as variable isnt used
    {
      code: `plural(count, {
        zero: \`# items\`,
        one: \`# item\`,
        other: \`# items\`,
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
    // React Plural component - hash format (default)
    {
      code: `<Plural value={messagesCount} one="There's # message in your inbox" other="There are # messages in your inbox" />`,
    },
    {
      code: `<Plural value={count} zero="# items" one="# item" other="# items" />`,
    },
    // React Plural component - template format when configured
    {
      code: `<Plural value={messagesCount} one={\`There's \${messagesCount} message in your inbox\`} other={\`There are \${messagesCount} messages in your inbox\`} />`,
      options: [{ style: 'template' }],
    },
    {
      code: `<Plural value={count} zero={\`\${count} items\`} one={\`\${count} item\`} other={\`\${count} items\`} />`,
      options: [{ style: 'template' }],
    },
    // No variables in some fields
    {
      code: `plural(count, {zero: "You have no items", one: "You have one item", other: '# items'})`,
    },
    {
      code: `plural(count, {zero: "You have no items", one: "You have one item", other: \`\${count} items\`})`,
      options: [{ style: 'template' }],
    },
  ],
  invalid: [
    // Hash style preferred (default), but template literals used
    {
      code: `plural(numBooks, {
        one: \`\${numBooks} book\`,
        other: \`\${numBooks} books\`,
      })`,
      errors: [{ messageId: 'hashRequired' }, { messageId: 'hashRequired' }],
    },
    {
      code: `plural(count, {
        zero: \`\${count} items\`,
        one: "# item",
        other: \`\${count} items\`,
      })`,
      errors: [{ messageId: 'hashRequired' }, { messageId: 'hashRequired' }],
    },
    // Template style preferred, but hash format used
    {
      code: `plural(numBooks, {
        one: "# book",
        other: "# books",
      })`,
      options: [{ style: 'template' }],
      errors: [{ messageId: 'templateRequired' }, { messageId: 'templateRequired' }],
    },
    {
      code: `plural(count, {
        zero: "# items",
        one: \`\${count} item\`,
        other: "# items",
      })`,
      options: [{ style: 'template' }],
      errors: [{ messageId: 'templateRequired' }, { messageId: 'templateRequired' }],
    },
    // hash style uses template strings, but still not allowed
    {
      code: `plural(count, {
        zero: \`# items\`,
        one: \`\${count} item\`,
        other: \`# items\`,
      })`,
      options: [{ style: 'template' }],
      errors: [{ messageId: 'templateRequired' }, { messageId: 'templateRequired' }],
    },
    // Mixed hash and template literal patterns in strings (hash preferred)
    {
      code: `plural(numBooks, {
        one: "\${numBooks} book",
        other: "# books",
      })`,
      errors: [{ messageId: 'hashRequired' }],
    },
    // React Plural component - template literals when hash preferred (default)
    {
      code: `<Plural value={messagesCount} one={\`There's \${messagesCount} message in your inbox\`} other={\`There are \${messagesCount} messages in your inbox\`} />`,
      errors: [{ messageId: 'hashRequired' }, { messageId: 'hashRequired' }],
    },
    {
      code: `<Plural value={count} zero={\`\${count} items\`} one="# item" other={\`\${count} items\`} />`,
      errors: [{ messageId: 'hashRequired' }, { messageId: 'hashRequired' }],
    },
    // React Plural component - hash format when template preferred
    {
      code: `<Plural value={messagesCount} one="There's # message in your inbox" other="There are # messages in your inbox" />`,
      options: [{ style: 'template' }],
      errors: [{ messageId: 'templateRequired' }, { messageId: 'templateRequired' }],
    },
    {
      code: `<Plural value={count} zero="# items" one={\`\${count} item\`} other="# items" />`,
      options: [{ style: 'template' }],
      errors: [{ messageId: 'templateRequired' }, { messageId: 'templateRequired' }],
    },
    // Errors in plural calls with variable in only one field
    {
      code: `plural(count, {zero: "You have no items", one: "You have one item", other: "# items"})`,
      options: [{ style: 'template' }],
      errors: [{ messageId: 'templateRequired' }],
    },
    {
      code: `plural(count, {zero: "You have no items", one: "# item", other: \`\${count} items\`})`,
      errors: [{ messageId: 'hashRequired' }],
    },
  ],
})
