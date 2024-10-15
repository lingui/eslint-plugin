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
    },
    {
      code: 't`Hello ${hello}`',
    },
    {
      code: 'msg`Hello ${hello}`',
    },
    {
      code: 'defineMessage`Hello ${hello}`',
    },
    {
      code: 't`${hello} Hello ${hello}`',
    },
    {
      code: 't({message: "StringLiteral"})',
    },
    {
      code: '<Trans>Hello</Trans>',
    },

    {
      code: '<Trans>Hello {hello}</Trans>',
    },

    {
      code: '<Trans>{hello} Hello {hello}</Trans>',
    },

    {
      code: '<Trans><b>Hello</b></Trans>',
    },

    {
      code: '{hello}',
    },

    {
      code: '`${hello}`',
    },
    {
      code: 'b({message: `${hello}`})',
    },
    {
      code: 't({message: `Hello ${user}`})',
    },
    {
      code: 'msg({message: `Hello ${user}`})',
    },
    {
      code: 'defineMessage({message: `Hello ${user}`})',
    },
    {
      code: '<Trans id={lazyTranslation.id} />',
    },
  ],

  invalid: [
    {
      code: '<Trans>{hello}</Trans>',

      errors: errorsForTrans,
    },
    {
      code: '<Trans>{hello} {hello}</Trans>',

      errors: errorsForTrans,
    },
    {
      code: `<Trans>
                {formatCurrency(
                    invoice.total.value,
                    invoice.total.currency
                )}
            </Trans>`,

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

      errors: errorsForTrans,
    },
    {
      code: 't`${hello}`',

      errors: errorsForT,
    },
    {
      code: 'msg`${hello}`',

      errors: errorsForT,
    },
    {
      code: 'defineMessage`${hello}`',

      errors: errorsForT,
    },
    {
      code: 't({message: `${hello}`})',
      errors: errorsForT,
    },
    {
      code: 'msg({message: `${user}`})',
      errors: errorsForT,
    },
    {
      code: 'defineMessage({message: `${user}`})',
      errors: errorsForT,
    },
  ],
})
