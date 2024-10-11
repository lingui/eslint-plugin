import { rule, name } from '../../../src/rules/no-trans-inside-trans'
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
  ],
  invalid: [
    {
      code: '<Trans>Hello, <Trans>John</Trans></Trans>',
      errors: [{ messageId: 'default' }],
    },
    {
      code: ` <Trans>
      All <Trans>done</Trans>
  </Trans>`,
      errors: [{ messageId: 'default' }],
    },
  ],
})
