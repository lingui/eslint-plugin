import { rule, name } from '../../../src/rules/no-single-variables-to-translate'
import { RuleTester } from '@typescript-eslint/rule-tester'

describe('', () => {})

const errorsForTrans = [{ messageId: 'asJsx' }] as const
const errorsForT = [{ messageId: 'asFunction' }] as const

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
      code: 't`Hello`',
      options: [],
    },
    {
      code: 't`Hello ${hello}`',
      options: [],
    },
    {
      code: 'msg`Hello ${hello}`',
      options: [],
    },
    {
      code: 'defineMessage`Hello ${hello}`',
      options: [],
    },
    {
      code: 't`${hello} Hello ${hello}`',
      options: [],
    },

    {
      code: '<Trans>Hello</Trans>',
      options: [],
    },

    {
      code: '<Trans>Hello {hello}</Trans>',
      options: [],
    },

    {
      code: '<Trans>{hello} Hello {hello}</Trans>',
      options: [],
    },

    {
      code: '<Trans><b>Hello</b></Trans>',
      options: [],
    },

    {
      code: '{hello}',
      options: [],
    },

    {
      code: '`${hello}`',
      options: [],
    },

    {
      code: '<Trans id={lazyTranslation.id} />',
      options: [],
    },
  ],

  invalid: [
    {
      code: '<Trans>{hello}</Trans>',
      options: [],
      errors: errorsForTrans,
    },
    {
      code: '<Trans>{hello} {hello}</Trans>',
      options: [],
      errors: errorsForTrans,
    },
    {
      code: `<Trans>
                {formatCurrency(
                    invoice.total.value,
                    invoice.total.currency
                )}
            </Trans>`,
      options: [],
      errors: errorsForTrans,
    },
    {
      code: `<Trans>
                {limitType}{' '}
                {formatCurrency(
                    Math.abs(employee.limits.limitValue),
                    currency
                )}
            </Trans>`,
      errors: errorsForTrans,
    },
    {
      code: `<Trans>
                {formatCurrency(
                    invoice.total.value,
                    invoice.total.currency
                )}
                {formatCurrency(
                    invoice.total.value,
                    invoice.total.currency
                )}
            </Trans>`,
      options: [],
      errors: errorsForTrans,
    },
    {
      code: 't`${hello}`',
      options: [],
      errors: errorsForT,
    },
    {
      code: 'msg`${hello}`',
      options: [],
      errors: errorsForT,
    },
    {
      code: 'defineMessage`${hello}`',
      options: [],
      errors: errorsForT,
    },
  ],
})
