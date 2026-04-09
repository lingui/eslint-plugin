import { rule, name } from '../../../src/rules/require-explicit-comment'
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
    // Call expressions with explicit comment
    {
      code: 't({ comment: "Greeting", message: "Hello" })',
    },
    {
      code: 'msg({ comment: "Greeting", message: "Hello" })',
    },
    {
      code: 'defineMessage({ comment: "Greeting", message: "Hello" })',
    },
    // Presence-only: non-literal comment values are accepted
    {
      code: 't({ comment: commentHint, message: "Hello" })',
    },
    {
      code: 't({ comment: getHint(), message: "Hello" })',
    },
    // context allows omitting comment
    {
      code: 't({ context: "homepage", message: "Hello" })',
    },
    {
      code: 'defineMessage({ context: "navigation.link", message: "About us" })',
    },
    // non-object and no-arg calls are intentionally ignored
    {
      code: 't()',
    },
    {
      code: 't("Hello")',
    },

    // Trans and React macros with explicit comment
    {
      code: '<Trans comment="Greeting">Hello</Trans>',
    },
    {
      code: '<Plural value={count} one="# Book" other="# Books" comment="Book count" />',
    },
    {
      code: '<Select value={gender} _male="His book" _female="Her book" other="Their book" comment="Possessive pronoun" />',
    },
    {
      code: '<SelectOrdinal value={count} one="#st" two="#nd" few="#rd" other="#th" comment="Ordinal suffix" />',
    },
    // Presence-only: non-literal JSX comment values are accepted
    {
      code: '<Trans comment={commentHint}>Hello</Trans>',
    },
    {
      code: '<Plural value={count} one="# Book" other="# Books" comment={getHint()} />',
    },
    // context allows omitting comment in JSX macros
    {
      code: '<Trans context="homepage">Hello</Trans>',
    },
    {
      code: '<Plural value={count} one="# Book" other="# Books" context="book.counter" />',
    },
    {
      code: '<Select value={gender} _male="His book" _female="Her book" other="Their book" context="profile.possessive" />',
    },
    {
      code: '<SelectOrdinal value={count} one="#st" two="#nd" few="#rd" other="#th" context="ordinal.short" />',
    },
  ],
  invalid: [
    // Tagged template literals must switch to object form for comment/context
    {
      code: 't`Hello`',
      errors: [{ messageId: 'noCommentInTaggedTemplate' }],
    },
    {
      code: 'msg`Hello`',
      errors: [{ messageId: 'noCommentInTaggedTemplate' }],
    },
    {
      code: 'defineMessage`Hello`',
      errors: [{ messageId: 'noCommentInTaggedTemplate' }],
    },

    // Call expressions missing both comment and context
    {
      code: 't({ message: "Hello" })',
      errors: [{ messageId: 'missingCommentCall' }],
    },
    {
      code: 'msg({ id: "msg.hello", message: "Hello" })',
      errors: [{ messageId: 'missingCommentCall' }],
    },
    {
      code: 'defineMessage({ id: "msg.hello", message: "Hello" })',
      errors: [{ messageId: 'missingCommentCall' }],
    },

    // JSX macros missing both comment and context
    {
      code: '<Trans>Hello</Trans>',
      errors: [{ messageId: 'missingCommentJsx' }],
    },
    {
      code: '<Plural value={count} one="# Book" other="# Books" />',
      errors: [{ messageId: 'missingCommentJsx' }],
    },
    {
      code: '<Select value={gender} _male="His book" _female="Her book" other="Their book" />',
      errors: [{ messageId: 'missingCommentJsx' }],
    },
    {
      code: '<SelectOrdinal value={count} one="#st" two="#nd" few="#rd" other="#th" />',
      errors: [{ messageId: 'missingCommentJsx' }],
    },
  ],
})
