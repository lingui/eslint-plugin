import { rule, name } from '../../../src/rules/require-directive-reset'
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
      name: 'ignores a file without directives',
      code: `
        // A regular comment
        const title = t\`Order summary\`
      `,
    },
    {
      name: 'allows a directive closed by a reset',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
        // lingui-reset
      `,
    },
    {
      name: 'allows directives declared in block comments',
      code: `
        /* lingui-set comment="Checkout page strings" */
        const title = t\`Order summary\`
        /* lingui-reset */
      `,
    },
    {
      name: 'allows consecutive closed scopes',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
        // lingui-reset

        // lingui-set comment="Settings page strings"
        const preferences = t\`Preferences\`
        // lingui-reset
      `,
    },
    {
      name: 'allows a single reset to close every accumulated value',
      code: `
        // lingui-set context="checkout"
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
        // lingui-reset
      `,
    },
    {
      name: 'allows a reset that opens a scope of its own and is closed in turn',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
        // lingui-reset comment="Settings page strings"
        const preferences = t\`Preferences\`
        // lingui-reset
      `,
    },
    {
      name: 'allows a directive that only unsets values',
      code: `
        // lingui-set comment="Checkout page strings"
        // lingui-set comment=""
        const title = t\`Order summary\`
      `,
    },
    {
      name: 'ignores a malformed directive',
      code: `
        // lingui-set comment=Checkout
        const title = t\`Order summary\`
      `,
    },
  ],
  invalid: [
    {
      name: 'reports a directive that is never reset',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
      `,
      errors: [{ messageId: 'missingReset', data: { directive: 'lingui-set' }, line: 2 }],
    },
    {
      name: 'reports only the directive still in effect',
      code: `
        // lingui-set context="checkout"
        const title = t\`Order summary\`
        // lingui-set comment="Checkout page strings"
        const cta = t\`Complete purchase\`
      `,
      errors: [{ messageId: 'missingReset', line: 4 }],
    },
    {
      name: 'reports a reset that opens a scope and is never closed',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
        // lingui-reset comment="Settings page strings"
        const preferences = t\`Preferences\`
      `,
      errors: [{ messageId: 'missingReset', data: { directive: 'lingui-reset' }, line: 4 }],
    },
    {
      name: 'reports a reset with no directive in effect',
      code: `
        // lingui-reset
        const title = t\`Order summary\`
      `,
      errors: [{ messageId: 'redundantReset', line: 2 }],
    },
    {
      name: 'reports a reset that follows another reset',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
        // lingui-reset
        // lingui-reset
      `,
      errors: [{ messageId: 'redundantReset', line: 5 }],
    },
    {
      name: 'reports a redundant reset and a missing one in the same file',
      code: `
        // lingui-reset
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
      `,
      errors: [
        { messageId: 'redundantReset', line: 2 },
        { messageId: 'missingReset', line: 3 },
      ],
    },
  ],
})
