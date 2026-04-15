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
    // ─── Base rule (no options) ───────────────────────────────────────

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

    // Tagged templates — always valid when requireContext is false
    {
      code: 't`Hello`',
    },
    {
      code: 'msg`Hello`',
    },
    {
      code: 'defineMessage`Hello`',
    },

    // ─── requireContext: true ─────────────────────────────────────────

    // Trans with context — valid
    {
      code: '<Trans context="direction">Right</Trans>',
      options: [{ requireContext: true }],
    },
    {
      code: '<Trans context="correctness">Right</Trans>',
      options: [{ requireContext: true }],
    },
    {
      code: '<Trans context={someVar}>Right</Trans>',
      options: [{ requireContext: true }],
    },

    // Call expressions with context — valid
    {
      code: 't({ message: "right", context: "direction" })',
      options: [{ requireContext: true }],
    },
    {
      code: 'msg({ message: "right", context: "correctness" })',
      options: [{ requireContext: true }],
    },
    {
      code: 'defineMessage({ message: "right", context: "direction" })',
      options: [{ requireContext: true }],
    },
    // String literal key 'context' — treated like identifier key
    {
      code: "t({ message: 'right', 'context': 'direction' })",
      options: [{ requireContext: true }],
    },
    // Call expression with no arguments — early return, no error
    {
      code: 't()',
      options: [{ requireContext: true }],
    },
    // Call expression with non-object argument — early return, no error
    {
      code: 't("Hello")',
      options: [{ requireContext: true }],
    },
  ],
  invalid: [
    // ─── Base rule (no options) — id is forbidden ─────────────────────

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

    // ─── requireContext: true — missing context ───────────────────────

    // Trans missing context
    {
      code: '<Trans>Right</Trans>',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'missingContextTrans' }],
    },
    {
      code: '<Trans render="span">Right</Trans>',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'missingContextTrans' }],
    },

    // Call expressions missing context
    {
      code: 't({ message: "right" })',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'missingContextCall' }],
    },
    {
      code: 'msg({ message: "right" })',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'missingContextCall' }],
    },
    {
      code: 'defineMessage({ message: "right" })',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'missingContextCall' }],
    },

    // Tagged templates — can't carry context, must use function call form
    {
      code: 't`right`',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'noContextInTaggedTemplate' }],
    },
    {
      code: 'msg`right`',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'noContextInTaggedTemplate' }],
    },
    {
      code: 'defineMessage`right`',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'noContextInTaggedTemplate' }],
    },

    // ─── requireContext: true — both id forbidden AND context missing ─

    // Trans with id but no context — two errors
    {
      code: '<Trans id="msg.hello">Hello</Trans>',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'missingContextTrans' }, { messageId: 'forbiddenIdTrans' }],
    },

    // Call expression with id but no context — two errors
    {
      code: 't({ id: "msg.hello", message: "Hello" })',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'missingContextCall' }, { messageId: 'forbiddenIdCall' }],
    },

    // Call expression with id and context — only id error
    {
      code: 't({ id: "msg.hello", message: "Hello", context: "greeting" })',
      options: [{ requireContext: true }],
      errors: [{ messageId: 'forbiddenIdCall' }],
    },
  ],
})



