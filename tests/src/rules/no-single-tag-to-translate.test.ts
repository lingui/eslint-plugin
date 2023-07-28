import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'
import rule from '../../../src/rules/no-single-tag-to-translate'
import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint/RuleTester'

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

tsTester.run<string, readonly unknown[]>('no-single-tag-to-translate (ts)', rule, tests)
