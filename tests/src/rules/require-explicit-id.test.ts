import { rule, name } from '../../../src/rules/require-explicit-id'
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
    // Trans component
    {
      code: '<Trans id="msg.hello">Hello</Trans>',
    },
    {
      code: '<Trans id="msg.docs">Read the <a href="https://lingui.dev">documentation</a> for more info.</Trans>',
    },
    {
      code: '<Trans id="msg.greeting" render="span">Hello World</Trans>',
    },
    // Trans with patterns option — id matches
    {
      code: '<Trans id="msg.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    {
      code: '<Trans id="msg.docs">Docs</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // JSXExpressionContainer with string literal — treated like plain string
    {
      code: '<Trans id={"msg.hello"}>Hello</Trans>',
    },
    {
      code: '<Trans id={"msg.hello"}>Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // expression id with patterns — silently skipped
    {
      code: '<Trans id={someVar}>Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // boolean id attribute — silently skipped (no string value to validate)
    {
      code: '<Trans id>Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // non-string expression — silently skipped
    {
      code: '<Trans id={42}>Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // flags option — case-insensitive match
    {
      code: '<Trans id="MSG.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'], flags: 'i' }],
    },
    // id matches one of multiple patterns
    {
      code: '<Trans id="err.notFound">Not Found</Trans>',
      options: [{ patterns: ['^msg\\.', '^err\\.'] }],
    },

    // Call expressions with id
    {
      code: 't({ id: "msg.hello", message: "Hello" })',
    },
    {
      code: 'msg({ id: "msg.hello", message: "Hello" })',
    },
    {
      code: 'defineMessage({ id: "msg.hello", message: "Hello" })',
    },
    // Call expression with patterns — id matches
    {
      code: 't({ id: "msg.hello", message: "Hello" })',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // Call expression with expression id — silently skipped
    {
      code: 't({ id: someVar, message: "Hello" })',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // Call expression id matches one of multiple patterns
    {
      code: 't({ id: "err.notFound", message: "Not Found" })',
      options: [{ patterns: ['^msg\\.', '^err\\.'] }],
    },
    // Call expression with no arguments — early return, no error
    {
      code: 't()',
    },
    // Call expression with non-object argument — early return, no error
    {
      code: 't("Hello")',
    },
    // Call expression with string literal key 'id' — treated like identifier key
    {
      code: "t({ 'id': 'msg.hello', message: 'Hello' })",
    },
    {
      code: "t({ 'id': 'msg.hello', message: 'Hello' })",
      options: [{ patterns: ['^msg\\.'] }],
    },

    // ICU components with id — valid
    {
      code: '<Plural id="msg.books" value={count} one="# book" other="# books" />',
    },
    {
      code: '<SelectOrdinal id="msg.order" value={order} one="#st" two="#nd" few="#rd" other="#th" />',
    },
    {
      code: '<Select id="msg.gender" value={gender} male="He" female="She" other="They" />',
    },
    // ICU component with patterns — id matches
    {
      code: '<Plural id="msg.books" value={count} one="# book" other="# books" />',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // ICU component with expression id and patterns — silently skipped
    {
      code: '<Plural id={someVar} value={count} one="# book" other="# books" />',
      options: [{ patterns: ['^msg\\.'] }],
    },
  ],
  invalid: [
    // Trans — missing id
    {
      code: '<Trans>Hello</Trans>',
      errors: [{ messageId: 'default' }],
    },
    {
      code: '<Trans render="span">Hello</Trans>',
      errors: [{ messageId: 'default' }],
    },
    {
      code: `<Trans>
        Read the <a href="https://lingui.dev">documentation</a>
        for more info.
      </Trans>`,
      errors: [{ messageId: 'default' }],
    },
    // Trans — missing id with patterns option still reports 'default'
    {
      code: '<Trans>Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'default' }],
    },
    // Trans — id present but doesn't match any pattern
    {
      code: '<Trans id="hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    {
      code: '<Trans id="greeting.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    // flags — case-sensitive by default, so uppercase fails
    {
      code: '<Trans id="MSG.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    // id doesn't match any of multiple patterns
    {
      code: '<Trans id="greeting.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.', '^err\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    // JSXExpressionContainer string literal — id doesn't match pattern
    {
      code: '<Trans id={"hello"}>Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    {
      code: '<Trans id={"greeting.hello"}>Hello</Trans>',
      options: [{ patterns: ['^msg\\.', '^err\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },

    // Tagged template literals — always invalid (can't provide id)
    {
      code: 't`Hello`',
      errors: [{ messageId: 'noIdInTaggedTemplate' }],
    },
    {
      code: 'msg`Hello`',
      errors: [{ messageId: 'noIdInTaggedTemplate' }],
    },
    {
      code: 'defineMessage`Hello`',
      errors: [{ messageId: 'noIdInTaggedTemplate' }],
    },

    // Call expressions — missing id
    {
      code: 't({ message: "Hello" })',
      errors: [{ messageId: 'missingIdCall' }],
    },
    {
      code: 'msg({ message: "Hello" })',
      errors: [{ messageId: 'missingIdCall' }],
    },
    {
      code: 'defineMessage({ message: "Hello" })',
      errors: [{ messageId: 'missingIdCall' }],
    },
    // Call expression — id doesn't match pattern
    {
      code: 't({ id: "hello", message: "Hello" })',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    // Call expression — id doesn't match any of multiple patterns
    {
      code: 't({ id: "greeting.hello", message: "Hello" })',
      options: [{ patterns: ['^msg\\.', '^err\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    // Call expression with string literal key 'id' — doesn't match pattern
    {
      code: "t({ 'id': 'hello', message: 'Hello' })",
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },

    // ICU components — missing id
    {
      code: '<Plural value={count} one="# book" other="# books" />',
      errors: [{ messageId: 'missingIdIcu' }],
    },
    {
      code: '<SelectOrdinal value={order} one="#st" two="#nd" few="#rd" other="#th" />',
      errors: [{ messageId: 'missingIdIcu' }],
    },
    {
      code: '<Select value={gender} male="He" female="She" other="They" />',
      errors: [{ messageId: 'missingIdIcu' }],
    },
    // ICU component — id doesn't match pattern
    {
      code: '<Plural id="hello" value={count} one="# book" other="# books" />',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
  ],
})
