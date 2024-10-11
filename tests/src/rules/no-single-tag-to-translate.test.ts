import { rule, name } from '../../../src/rules/no-single-tag-to-translate'
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
})
