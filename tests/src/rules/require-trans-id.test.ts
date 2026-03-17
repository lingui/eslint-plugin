import { rule, name } from '../../../src/rules/require-trans-id'
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
      code: '<Trans id="msg.hello">Hello</Trans>',
    },
    {
      code: '<Trans id="msg.docs">Read the <a href="https://lingui.dev">documentation</a> for more info.</Trans>',
    },
    {
      code: '<Trans id="msg.greeting" render="span">Hello World</Trans>',
    },
  ],
  invalid: [
    {
      code: '<Trans>Hello</Trans>',
      errors: [{ messageId: 'default' }],
    },
    {
      code: '<Trans render="span">Hello</Trans>',
      errors: [{ messageId: 'default' }],
    },
    {
      code: `<Trans>
        Read the <a href="https://lingui.dev">documentation</a>
        for more info.
      </Trans>`,
      errors: [{ messageId: 'default' }],
    },
  ],
})
