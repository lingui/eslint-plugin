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
    {
      name: 'Should not be triggered for JSX Whitespace expression',
      code: "<Trans>Did you mean{' '}<span>something</span>{` `}</Trans>",
    },
    {
      name: 'Template literals as children with identifiers',
      code: ' <Trans>{`How much is ${expression}? ${count}`}</Trans>',
    },
    {
      name: 'Strings as children are preserved',
      code: '<Trans>{"hello {count, plural, one {world} other {worlds}}"}</Trans>',
    },
    {
      code: 't`hello ${{name: obj.prop}}`',
    },
    {
      code: 't`hello ${ph({name: obj.prop})}`',
    },
    {
      code: '<Trans>hello {{name: obj.prop}}</Trans>',
    },
    {
      code: '<Trans>hello {ph({name: obj.prop})}</Trans>',
    },
    {
      name: 'Identifiers are allowed when allowIdentifiers is true',
      code: 't`Hello ${hello}`',
      options: [{ allowIdentifiers: true }],
    },
    {
      name: 'Explicit labels are allowed when allowIdentifiers is false',
      code: 't`Hello ${ph({ name })} ${{ surname }}`',
      options: [{ allowIdentifiers: false }],
    },
    {
      name: 'Nested macros are allowed when allowIdentifiers is false',
      code: "t`You have ${plural(count, { one: '# message', other: '# messages' })}`",
      options: [{ allowIdentifiers: false }],
    },
    {
      name: 'Explicit labels in JSX are allowed when allowIdentifiers is false',
      code: '<Trans>Hello {ph({ name })} {{ surname }}</Trans>',
      options: [{ allowIdentifiers: false }],
    },
    {
      name: 'Whitespace and attributes are not placeholders when allowIdentifiers is false',
      code: "<Trans>Did you mean{' '}<MyComponent prop={value}>something</MyComponent></Trans>",
      options: [{ allowIdentifiers: false }],
    },
  ],
  invalid: [
    {
      code: 't`hello ${obj.prop}?`',
      errors: [{ messageId: 'default', data: { expression: 'obj.prop', label: 'prop' } }],
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
      name: 'Should trigger for each expression in the message',
      code: 't`hello ${obj.prop} ${obj.prop}?`',
      errors: [{ messageId: 'default' }, { messageId: 'default' }],
    },
    {
      code: '<Trans>Hello {obj.prop}</Trans>',
      errors: [{ messageId: 'default', data: { expression: 'obj.prop', label: 'prop' } }],
    },
    {
      name: 'Template literals as children with expressions',
      code: '<Trans>{`How much is ${obj.prop}?`}</Trans>',
      errors: [{ messageId: 'default' }],
    },
    {
      code: 't`hello ${func()}?`',
      errors: [{ messageId: 'default', data: { expression: 'func()', label: 'func' } }],
    },
    {
      name: 'Suggests the last property name for a member call',
      code: 't`hello ${user.getName()}?`',
      errors: [{ messageId: 'default', data: { expression: 'user.getName()', label: 'getName' } }],
    },
    {
      name: 'Falls back to a generic label for other expressions',
      code: 't`hello ${a + b}?`',
      errors: [{ messageId: 'default', data: { expression: 'a + b', label: 'value' } }],
    },
    {
      name: 'Falls back to a generic label for computed member access',
      code: 't`hello ${obj[key]}?`',
      errors: [{ messageId: 'default', data: { expression: 'obj[key]', label: 'value' } }],
    },
    {
      code: 't`hello ${{name: obj.foo, surname: obj.bar}}`',
      errors: [{ messageId: 'multiplePlaceholders' }],
    },
    {
      code: 't`hello ${greeting({name: obj.prop})}`',
      errors: [{ messageId: 'default' }],
    },
    {
      code: '<Trans>hello {{name: obj.foo, surname: obj.bar}}</Trans>',
      errors: [{ messageId: 'multiplePlaceholders' }],
    },
    {
      code: '<Trans>hello {greeting({name: obj.prop})}</Trans>',
      errors: [{ messageId: 'default' }],
    },
    {
      name: 'Reports identifiers in tagged templates when allowIdentifiers is false',
      code: 't`Hello ${name}`',
      options: [{ allowIdentifiers: false }],
      errors: [{ messageId: 'identifier', data: { expression: 'name' } }],
    },
    {
      name: 'Reports identifiers in msg and defineMessage when allowIdentifiers is false',
      code: 'msg`Hello ${name}`; defineMessage`Hello ${name}`',
      options: [{ allowIdentifiers: false }],
      errors: [
        { messageId: 'identifier', data: { expression: 'name' } },
        { messageId: 'identifier', data: { expression: 'name' } },
      ],
    },
    {
      name: 'Reports identifiers in message descriptors when allowIdentifiers is false',
      code: 't({ message: `Hello ${user}?` })',
      options: [{ allowIdentifiers: false }],
      errors: [{ messageId: 'identifier', data: { expression: 'user' } }],
    },
    {
      name: 'Reports identifiers in Trans when allowIdentifiers is false',
      code: '<Trans>Hello {userName}</Trans>',
      options: [{ allowIdentifiers: false }],
      errors: [{ messageId: 'identifier', data: { expression: 'userName' } }],
    },
    {
      name: 'Reports identifiers in template literals inside Trans when allowIdentifiers is false',
      code: '<Trans>{`How much is ${expression}? ${count}`}</Trans>',
      options: [{ allowIdentifiers: false }],
      errors: [
        { messageId: 'identifier', data: { expression: 'expression' } },
        { messageId: 'identifier', data: { expression: 'count' } },
      ],
    },
    {
      name: 'Reports identifiers and expressions side by side when allowIdentifiers is false',
      code: 't`Hello ${name} ${user.surname}`',
      options: [{ allowIdentifiers: false }],
      errors: [
        { messageId: 'identifier', data: { expression: 'name' } },
        { messageId: 'default', data: { expression: 'user.surname', label: 'surname' } },
      ],
    },
  ],
})
