import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'
import rule from '../../../src/rules/no-single-variables-to-translate'
import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint/RuleTester'

const errorsForTrans = [{ messageId: 'asJsx' }]
const errorsForT = [{ messageId: 'asFunction' }]

var ruleTester = new RuleTester({
  parser: TYPESCRIPT_ESLINT,
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
})
ruleTester.run<string, readonly unknown[]>('no-single-varibles-to-translate', rule, {
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
  ],
})
