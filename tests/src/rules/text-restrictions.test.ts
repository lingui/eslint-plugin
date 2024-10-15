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
      code: 't`Hello`',
      options: [
        {
          rules: [quotesRule],
        },
      ],
    },
    {
      code: 't`Hello ${kek}`',
      options: [
        {
          rules: [quotesRule],
        },
      ],
    },
    {
      code: 't({message: `Hello ${kek}`})',
      options: [
        {
          rules: [quotesRule],
        },
      ],
    },
    {
      code: 'b({message: `Hell“o“`})',
      options: [
        {
          rules: [quotesRule],
        },
      ],
    },
    {
      code: '<Trans>Hello</Trans>',
      options: [
        {
          rules: [quotesRule],
        },
      ],
    },
    {
      code: '<Trans>Email</Trans>',
      options: [
        {
          rules: [wordRule],
        },
      ],
    },
    {
      code: '<Trans>email</Trans>',
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
      code: 't`Hell“o“`',
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: 'msg`Hell“o“`',
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: 'defineMessage`Hell“o“`',
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: 't({message: `Hell“o“`})',
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: "t({message: 'Hell“o“'})",
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: '<Trans>Hell“o“</Trans>',
      options: [
        {
          rules: [quotesRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: quotesRule.message } }],
    },
    {
      code: 't`Hell“o“`',
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
      code: '<Trans>E-mail</Trans>',
      options: [
        {
          rules: [wordRule],
        },
      ],
      errors: [{ messageId: 'default', data: { message: wordRule.message } }],
    },
    {
      code: '<Trans>e-mail</Trans>',
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
