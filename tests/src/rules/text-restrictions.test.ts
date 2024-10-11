import { rule, Option, RestrictionRule } from '../../../src/rules/text-restrictions'

import { RuleTester } from '@typescript-eslint/rule-tester'

describe('', () => {})

const quotesRule: RestrictionRule = {
  patterns: ["''", '’', '“'],
  message: `Quotes should be ' or "`,
}

const bracketRule: RestrictionRule = {
  patterns: ['<', '>', '&lt;', '&gt;'],
  message: 'Exclude <,> symbols from translations',
  isOnlyForTranslation: true,
}

const wordRule: RestrictionRule = {
  patterns: ['e-mail'],
  message: `Use email instead of e-mail`,
  flags: 'i',
}

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

ruleTester.run<string, Option[]>('text-restrictions (ts)', rule, {
  valid: [
    {
      code: "i18n._('Hello')",
      options: [
        {
          rules: [quotesRule],
        },
      ],
    },
    {
      code: 'i18n._(`Hello ${kek}`)',
      options: [
        {
          rules: [quotesRule],
        },
      ],
    },
    {
      code: '<div>Hello</div>',
      options: [
        {
          rules: [quotesRule],
        },
      ],
    },
    {
      code: '<div>Email</div>',
      options: [
        {
          rules: [wordRule],
        },
      ],
    },
    {
      code: '<div>email</div>',
      options: [
        {
          rules: [wordRule],
        },
      ],
    },
    {
      code: '<div>&lt;<Trans>email</Trans></div>',
      options: [
        {
          rules: [bracketRule],
        },
      ],
    },
    {
      code: 'c`<`',
      options: [
        {
          rules: [bracketRule],
        },
      ],
    },
    {
      code: "requiredOption('--config <configPath>', 'path to the lambda configuration')",
      options: [
        {
          rules: [bracketRule],
        },
      ],
    },
  ],

  invalid: [
    {
      code: "i18n._('Hell“o“')",
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: 'i18n._(`Hell“o“`)',
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: '<div>Hell“o“</div>',
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: "i18n._('Hell“o“')",
      options: [
        {
          rules: [
            quotesRule,
            {
              patterns: ['o'],
              message: 'o is forbidden',
            },
          ],
        },
      ],
      errors: [
        { messageId: 'default', data: { message: quotesRule.message } },
        { messageId: 'default', data: { message: 'o is forbidden' } },
      ],
    },
    {
      code: '<div>E-mail</div>',
      options: [
        {
          rules: [wordRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: wordRule.message } }],
    },
    {
      code: '<div>e-mail</div>',
      options: [
        {
          rules: [wordRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: wordRule.message } }],
    },
    {
      code: '<Trans>&lt;email</Trans>',
      options: [
        {
          rules: [bracketRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: bracketRule.message } }],
    },
    {
      code: 't`<Hello`',
      options: [
        {
          rules: [bracketRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: bracketRule.message } }],
    },
  ],
})
