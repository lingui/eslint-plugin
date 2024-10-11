import { rule, name } from '../../../src/rules/no-expression-in-message'
import { RuleTester } from '@typescript-eslint/rule-tester'

describe('', () => {})

const ruleTester = new RuleTester()

ruleTester.run(name, rule, {
  valid: [
    {
      code: '`Hello ${hello}`',
    },
    {
      code: '`Hello ${obj.prop}`',
    },
    {
      code: '`Hello ${func()}`',
    },
    {
      code: 'g`Hello ${hello}`',
    },
    {
      code: 'g`Hello ${obj.prop}`',
    },
    {
      code: 'g`Hello ${func()}`',
    },
    {
      code: 't`Hello ${hello}`',
    },
    {
      code: 't`Hello ${plural()}`',
    },
  ],
  invalid: [
    {
      code: 't`hello ${obj.prop}?`',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 't`hello ${func()}?`',
      errors: [{ messageId: 'default' }],
    },
  ],
})
