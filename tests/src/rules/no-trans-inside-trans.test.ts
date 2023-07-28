import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'
import rule from '../../../src/rules/no-trans-inside-trans'
import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint/RuleTester'

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const jsxTester = new RuleTester({
  parser: TYPESCRIPT_ESLINT,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
})

const tests = {
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
}

jsxTester.run<string, readonly unknown[]>('trans-inside-trans', rule, tests)
