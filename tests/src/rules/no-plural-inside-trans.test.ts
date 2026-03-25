import { rule, name } from '../../../src/rules/no-plural-inside-trans'
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
    {
      code: '<Trans>Hello</Trans>',
    },
    {
      code: '<Plural value={count} one="You have # unread message." other="You have # unread messages." />',
    },
  ],
  invalid: [
    {
      code: '<Trans>You have <Plural value={count} one="# unread message" other="# unread messages" />.</Trans>',
      errors: [{ messageId: 'default' }],
    },
  ],
})
