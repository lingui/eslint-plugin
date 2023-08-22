import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'
import rule from '../../../src/rules/no-expression-in-message'
import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint/RuleTester'
//import { RuleTester } from 'eslint'
//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const tsTester = new RuleTester({
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
      code: '`Hello ${hello}`',
    },
    {
      code: '`Hello ${obj.prop}`',
    },
    {
      code: '`Hello ${func()}`',
    },
    {
      code: 'g`Hello ${hello}`',
    },
    {
      code: 'g`Hello ${obj.prop}`',
    },
    {
      code: 'g`Hello ${func()}`',
    },
    {
      code: 't`Hello ${hello}`',
    },
  ],
  invalid: [
    {
      code: 't`hello ${obj.prop}?`',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 't`hello ${func()}?`',
      errors: [{ messageId: 'default' }],
    },
  ],
}

tsTester.run<string, readonly unknown[]>('i18n-template (ts)', rule, tests)
