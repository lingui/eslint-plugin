import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../src/rules/no-single-tag-to-translate.ts'),
  RuleTester = require('eslint').RuleTester

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

const TRANS_ERROR_MESSAGE = `<Trans></Trans> should not wrap a single element unnecessarily`

const tests = {
  valid: [
    {
      code: '<Trans>foo</Trans>',
    },
    {
      code: '<div><Trans>foo</Trans></div>',
    },
    {
      code: '<div><Trans>foo<br/>bar</Trans></div>',
    },
    {
      code: '<div><Trans>foo<strong>something bold!</strong>bar</Trans></div>',
    },
    {
      code: '<div><Trans>foo<div>hello there<strong>weee 😃</strong></div>bar</Trans></div>',
    },
  ],
  invalid: [
    {
      code: `<Trans><strong>Yoooo</strong></Trans>`,
      errors: [{ messageId: 'default' }],
    },
    {
      code: `<Trans><Foo><strong>Yoooo</strong></Foo></Trans>`,
      errors: [{ messageId: 'default' }],
    },
    {
      code: `<Trans>
        <strong>
          Yoooo
        </strong>
      </Trans>`,
      errors: [{ messageId: 'default' }],
    },
  ],
}

tsTester.run('no-single-tag-to-translate (ts)', rule, tests)
