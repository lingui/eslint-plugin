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
    // with patterns option — id matches
    {
      code: '<Trans id="msg.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    {
      code: '<Trans id="msg.docs">Docs</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // expression id with patterns — silently skipped
    {
      code: '<Trans id={someVar}>Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
    },
    // flags option — case-insensitive match
    {
      code: '<Trans id="MSG.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'], flags: 'i' }],
    },
    // id matches one of multiple patterns
    {
      code: '<Trans id="err.notFound">Not Found</Trans>',
      options: [{ patterns: ['^msg\\.', '^err\\.'] }],
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
    // missing id with patterns option still reports 'default'
    {
      code: '<Trans>Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'default' }],
    },
    // id present but doesn't match any pattern
    {
      code: '<Trans id="hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    {
      code: '<Trans id="greeting.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    // flags — case-sensitive by default, so uppercase fails
    {
      code: '<Trans id="MSG.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
    // id doesn't match any of multiple patterns
    {
      code: '<Trans id="greeting.hello">Hello</Trans>',
      options: [{ patterns: ['^msg\\.', '^err\\.'] }],
      errors: [{ messageId: 'invalidPattern' }],
    },
  ],
})
