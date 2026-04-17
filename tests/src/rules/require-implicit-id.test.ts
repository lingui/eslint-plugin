import { rule, name } from '../../../src/rules/require-implicit-id'
import { RuleTester } from '@typescript-eslint/rule-tester'

describe('', () => {})

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
    // Trans without id — valid
    {
      code: '<Trans>Hello</Trans>',
    },
    {
      code: '<Trans render="span">Hello World</Trans>',
    },
    {
      code: `<Trans>
        Read the <a href="https://lingui.dev">documentation</a>
        for more info.
      </Trans>`,
    },

    // Call expressions without id — valid
    {
      code: 't({ message: "Hello" })',
    },
    {
      code: 'msg({ message: "Hello" })',
    },
    {
      code: 'defineMessage({ message: "Hello" })',
    },
    // Call expression with no arguments — early return, no error
    {
      code: 't()',
    },
    // Call expression with non-object argument — early return, no error
    {
      code: 't("Hello")',
    },

    // Tagged templates — always valid
    {
      code: 't`Hello`',
    },
    {
      code: 'msg`Hello`',
    },
    {
      code: 'defineMessage`Hello`',
    },

    // ICU components without id — valid
    {
      code: '<Plural value={count} one="# book" other="# books" />',
    },
    {
      code: '<SelectOrdinal value={order} one="#st" two="#nd" few="#rd" other="#th" />',
    },
    {
      code: '<Select value={gender} male="He" female="She" other="They" />',
    },
  ],
  invalid: [
    // Trans with id — forbidden
    {
      code: '<Trans id="msg.hello">Hello</Trans>',
      errors: [{ messageId: 'forbiddenIdTrans' }],
    },
    {
      code: '<Trans id="msg.greeting" render="span">Hello World</Trans>',
      errors: [{ messageId: 'forbiddenIdTrans' }],
    },
    {
      code: '<Trans id={"msg.hello"}>Hello</Trans>',
      errors: [{ messageId: 'forbiddenIdTrans' }],
    },
    {
      code: '<Trans id={someVar}>Hello</Trans>',
      errors: [{ messageId: 'forbiddenIdTrans' }],
    },

    // Call expressions with id — forbidden
    {
      code: 't({ id: "msg.hello", message: "Hello" })',
      errors: [{ messageId: 'forbiddenIdCall' }],
    },
    {
      code: 'msg({ id: "msg.hello", message: "Hello" })',
      errors: [{ messageId: 'forbiddenIdCall' }],
    },
    {
      code: 'defineMessage({ id: "msg.hello", message: "Hello" })',
      errors: [{ messageId: 'forbiddenIdCall' }],
    },
    // String literal key 'id' — still forbidden
    {
      code: "t({ 'id': 'msg.hello', message: 'Hello' })",
      errors: [{ messageId: 'forbiddenIdCall' }],
    },
    // Expression id — still forbidden
    {
      code: 't({ id: someVar, message: "Hello" })',
      errors: [{ messageId: 'forbiddenIdCall' }],
    },

    // ICU components with id — forbidden
    {
      code: '<Plural id="msg.books" value={count} one="# book" other="# books" />',
      errors: [{ messageId: 'forbiddenIdIcu' }],
    },
    {
      code: '<SelectOrdinal id="msg.order" value={order} one="#st" two="#nd" few="#rd" other="#th" />',
      errors: [{ messageId: 'forbiddenIdIcu' }],
    },
    {
      code: '<Select id="msg.gender" value={gender} male="He" female="She" other="They" />',
      errors: [{ messageId: 'forbiddenIdIcu' }],
    },
  ],
})
