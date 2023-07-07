import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../src/rules/trans-inside-trans.ts'),
  RuleTester = require('eslint').RuleTester

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
      errors: [{ message: "Trans couldn't be wrapped into Trans" }],
    },
    {
      code: ` <Trans>
      All <Trans>done</Trans>
  </Trans>`,
      errors: [{ message: "Trans couldn't be wrapped into Trans" }],
    },
  ],
}

jsxTester.run('trans-inside-trans', rule, tests)
