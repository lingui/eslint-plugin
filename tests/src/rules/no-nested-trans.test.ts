import { RuleTester } from '@typescript-eslint/rule-tester'
import { rule, name } from '../../../src/rules/no-nested-trans'

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
    // Valid standalone usage
    {
      code: `const message = t\`Hello\``,
    },
    {
      code: `const message = t({ message: "Hello" })`,
    },
    {
      code: `const message = msg\`Hello\``,
    },
    {
      code: `const message = defineMessage\`Hello\``,
    },
    {
      code: `plural(count, { one: "one book", other: "There are many books" });`,
    },
    {
      code: `select(value, { male: "He", female: "She", other: "They" });`,
    },
    {
      code: `selectOrdinal(value, { one: "1st", two: "2nd", other: "#th" });`,
    },
    {
      code: `<Trans>There are many books</Trans>`,
    },
    {
      code: `<Plural value={count} one="one book" other="many books" />`,
    },
    {
      code: `<Select value={gender} male="He" female="She" other="They" />`,
    },
    {
      code: `<SelectOrdinal value={num} one="1st" two="2nd" other="#th" />`,
    },
    // Variables and expressions are okay
    {
      code: `<Trans>{variable}</Trans>`,
    },
    {
      code: `<Trans>{some.nested.variable}</Trans>`,
    },
    {
      code: `<Plural value={count} one="one book" other={\`\${count} books\`} />`,
    },
    // Adjacent usage is fine
    {
      code: `
        <div>
          <Trans>Hello</Trans>
          <Plural value={count} one="one" other="many" />
        </div>
      `,
    },
  ],

  invalid: [
    // t`` inside components
    {
      code: `<Trans>{t\`Hello\`}</Trans>`,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: '<Trans>' } }],
    },
    {
      code: `<Plural value={count} one="one book" other={t\`\${count} books\`} />`,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: '<Plural>' } }],
    },
    {
      code: `<Select value={gender} male={t\`He\`} female="She" other="They" />`,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: '<Select>' } }],
    },
    {
      code: `<SelectOrdinal value={num} one={t\`1st\`} other="#th" />`,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: '<SelectOrdinal>' } }],
    },

    // t() inside components
    {
      code: `<Trans>{t({ message: "Hello" })}</Trans>`,
      errors: [{ messageId: 'default', data: { childType: 't()', parentType: '<Trans>' } }],
    },
    {
      code: `<Plural value={count} one="one book" other={t({ message: "books" })} />`,
      errors: [{ messageId: 'default', data: { childType: 't()', parentType: '<Plural>' } }],
    },

    // Components inside other components
    {
      code: `<Trans><Plural value={count} one="one" other="many" /></Trans>`,
      errors: [{ messageId: 'default', data: { childType: '<Plural>', parentType: '<Trans>' } }],
    },
    {
      code: `<Plural value={count} one={<Trans>one</Trans>} other="many" />`,
      errors: [{ messageId: 'default', data: { childType: '<Trans>', parentType: '<Plural>' } }],
    },
    {
      code: `<Select value={gender} male={<Trans>He</Trans>} other="They" />`,
      errors: [{ messageId: 'default', data: { childType: '<Trans>', parentType: '<Select>' } }],
    },

    // Function calls inside components
    {
      code: `<Trans>{plural(count, { one: "one", other: "many" })}</Trans>`,
      errors: [{ messageId: 'default', data: { childType: 'plural()', parentType: '<Trans>' } }],
    },
    {
      code: `<Plural value={count} one="one" other={select(gender, { male: "books", other: "items" })} />`,
      errors: [{ messageId: 'default', data: { childType: 'select()', parentType: '<Plural>' } }],
    },

    // Function calls inside function calls
    {
      code: `plural(count, { one: "one book", other: t\`There are \${count} books\` });`,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: 'plural()' } }],
    },
    {
      code: `plural(count, { one: "one book", other: t({ message: "books" }) });`,
      errors: [{ messageId: 'default', data: { childType: 't()', parentType: 'plural()' } }],
    },
    {
      code: `select(gender, { male: t\`He is here\`, female: "She is here", other: "They are here" });`,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: 'select()' } }],
    },
    {
      code: `plural(count, { one: plural(1, { one: "nested", other: "error" }), other: "many" })`,
      errors: [{ messageId: 'default', data: { childType: 'plural()', parentType: 'plural()' } }],
    },

    // Tagged templates inside tagged templates
    {
      code: `t\`some text \${t\`some other text\`}\``,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: 't``' } }],
    },
    {
      code: `msg\`Hello \${t\`world\`}\``,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: 'msg``' } }],
    },
    {
      code: `defineMessage\`Hello \${t\`world\`}\``,
      errors: [{ messageId: 'default', data: { childType: 't``', parentType: 'defineMessage``' } }],
    },

    // Call expressions inside tagged templates
    {
      code: `t\`Hello \${plural(count, { one: "one", other: "many" })}\``,
      errors: [{ messageId: 'default', data: { childType: 'plural()', parentType: 't``' } }],
    },

    // Multiple nested violations
    {
      code: `
        <Trans>
          <Plural value={count} one={t\`one\`} other="many" />
        </Trans>
      `,
      errors: [
        { messageId: 'default', data: { childType: '<Plural>', parentType: '<Trans>' } },
        { messageId: 'default', data: { childType: 't``', parentType: '<Plural>' } },
      ],
    },
  ],
})
