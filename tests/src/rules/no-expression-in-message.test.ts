import { rule, name } from '../../../src/rules/no-expression-in-message'
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
      code: 'msg`Hello ${hello}`',
    },
    {
      code: 'defineMessage`Hello ${hello}`',
    },
    {
      code: 'b({message: `hello ${user.name}?`})',
    },
    {
      code: 't({message: `hello ${user}?`})',
    },
    {
      code: 't({message: "StringLiteral"})',
    },
    {
      code: 'msg({message: `hello ${user}?`})',
    },
    {
      code: 'defineMessage({message: `hello ${user}?`})',
    },
    {
      code: 't`Hello ${plural()}`',
    },
    {
      code: 't`Hello ${select()}`',
    },
    {
      code: 't`Hello ${selectOrdinal()}`',
    },
    {
      code: '<Trans>Hello <MyComponent prop={obj.prop}/></Trans>',
    },
    {
      code: '<Trans>Hello <MyComponent prop={func({foo: bar})}/></Trans>',
    },
    {
      code: '<Trans>Hello {userName}</Trans>',
    },
  ],
  invalid: [
    {
      code: 't`hello ${obj.prop}?`',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 'msg`hello ${obj.prop}?`',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 'defineMessage`hello ${obj.prop}?`',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 't({message: `hello ${obj.prop}?`})',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 'msg({message: `hello ${obj.prop}?`})',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 'defineMessage({message: `hello ${obj.prop}?`})',
      errors: [{ messageId: 'default' }],
    },
    {
      code: '<Trans>Hello {obj.prop}</Trans>',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 't`hello ${func()}?`',
      errors: [{ messageId: 'default' }],
    },
  ],
})
