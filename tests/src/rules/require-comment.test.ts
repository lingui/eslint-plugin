import { rule, name } from '../../../src/rules/require-comment'
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

const ignoreMetadata = [{ ignorePatterns: ['\\[[A-Z_]+=[^\\]]*\\]'] }]

ruleTester.run(name, rule, {
  valid: [
    {
      name: 'ignores code unrelated to Lingui',
      code: `
        const message = "Hello"
        const element = <OtherComponent>Hello</OtherComponent>
        otherFunction("Hello")
        otherTag\`Hello\`
      `,
    },

    // Components
    {
      name: 'allows <Trans> with a comment',
      code: '<Trans comment="Greeting on the homepage">Hello</Trans>',
    },
    {
      name: 'allows <Plural> with a comment',
      code: '<Plural value={count} one="# book" other="# books" comment="Books in the cart" />',
    },
    {
      name: 'allows <Select> with a comment',
      code: '<Select value={gender} _male="His book" other="Their book" comment="Book owner" />',
    },
    {
      name: 'allows <SelectOrdinal> with a comment',
      code: '<SelectOrdinal value={count} one="#st" other="#th" comment="Race position" />',
    },
    {
      name: 'allows a comment wrapped in an expression container',
      code: '<Trans comment={"Greeting on the homepage"}>Hello</Trans>',
    },
    {
      name: 'allows a template literal comment',
      code: '<Trans comment={`Greeting on the homepage`}>Hello</Trans>',
    },
    {
      name: 'trusts a comment that is only known at runtime',
      code: '<Trans comment={hint}>Hello</Trans>',
    },

    // Macro calls
    {
      name: 'allows t() with a comment',
      code: 't({ message: "Hello", comment: "Greeting on the homepage" })',
    },
    {
      name: 'allows msg() with a comment',
      code: 'msg({ message: "Hello", comment: "Greeting on the homepage" })',
    },
    {
      name: 'allows defineMessage() with a comment',
      code: 'defineMessage({ message: "Hello", comment: "Greeting on the homepage" })',
    },
    {
      name: 'allows a string literal comment key',
      code: 't({ message: "Hello", "comment": "Greeting on the homepage" })',
    },
    {
      name: 'ignores calls without a message descriptor',
      code: 't(i18n)`Hello`',
    },

    // Nested macros are part of the message of their parent
    {
      name: 'allows a nested macro described by its parent',
      code: '<Trans comment="Tasks left in the list">You have <Plural value={count} one="# task" other="# tasks" /></Trans>',
    },
    {
      name: 'allows a deeply nested macro described by its parent',
      code: '<Trans comment="Tasks left in the list"><span><Plural value={count} one="# task" other="# tasks" /></span></Trans>',
    },

    // Directives
    {
      name: 'allows a tagged template described by a directive',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
      `,
    },
    {
      name: 'allows a directive declared in a block comment',
      code: `
        /* lingui-set comment="Checkout page strings" */
        const title = msg\`Order summary\`
      `,
    },
    {
      name: 'allows a macro call described by a directive',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t({ message: "Order summary" })
      `,
    },
    {
      name: 'allows a component described by a directive',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = <Trans>Order summary</Trans>
      `,
    },
    {
      name: 'allows a macro with its own comment after a reset',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
        // lingui-reset
        const greeting = t({ message: "Hello", comment: "Greeting on the homepage" })
      `,
    },
    {
      name: 'keeps a comment in effect when a later directive only adds a context',
      code: `
        // lingui-set comment="Checkout page strings"
        // lingui-set context="checkout"
        const title = t\`Order summary\`
      `,
    },
    {
      name: 'allows a reset that declares a comment of its own',
      code: `
        // lingui-set comment="Checkout page strings"
        // lingui-reset comment="Settings page strings"
        const title = t\`Preferences\`
      `,
    },

    // allowContext
    {
      name: 'allows a component with a context when allowContext is enabled',
      code: '<Trans context="checkout">Order summary</Trans>',
      options: [{ allowContext: true }],
    },
    {
      name: 'allows a macro call with a context when allowContext is enabled',
      code: 't({ message: "Order summary", context: "checkout" })',
      options: [{ allowContext: true }],
    },
    {
      name: 'trusts a context that is only known at runtime when allowContext is enabled',
      code: '<Trans context={context}>Order summary</Trans>',
      options: [{ allowContext: true }],
    },
    {
      name: 'allows a context coming from a directive when allowContext is enabled',
      code: `
        // lingui-set context="checkout"
        const title = t\`Order summary\`
      `,
      options: [{ allowContext: true }],
    },

    // ignorePatterns
    {
      name: 'allows a component comment that describes the message besides its metadata',
      code: '<Trans comment="[CHAR_LIMIT=40] Label of the login button">Login</Trans>',
      options: ignoreMetadata,
    },
    {
      name: 'allows a macro call comment that describes the message besides its metadata',
      code: 't({ message: "Login", comment: "[CHAR_LIMIT=40] Label of the login button" })',
      options: ignoreMetadata,
    },
    {
      name: 'allows a directive comment that describes the messages besides its metadata',
      code: `
        // lingui-set comment="[CHAR_LIMIT=40] Checkout page strings"
        const title = t\`Order summary\`
      `,
      options: ignoreMetadata,
    },
    {
      name: 'allows metadata as a comment when no pattern is ignored',
      code: '<Trans comment="[CHAR_LIMIT=40]">Login</Trans>',
    },
    {
      name: 'strips patterns with the configured flags',
      code: '<Trans comment="[char_limit=40] Label of the login button">Login</Trans>',
      options: [{ ignorePatterns: ['\\[[A-Z_]+=[^\\]]*\\]'], flags: 'i' }],
    },
  ],
  invalid: [
    // Components
    {
      name: 'reports <Trans> without a comment',
      code: '<Trans>Hello</Trans>',
      errors: [{ messageId: 'missingCommentJsx', data: { component: 'Trans' } }],
    },
    {
      name: 'reports <Plural> without a comment',
      code: '<Plural value={count} one="# book" other="# books" />',
      errors: [{ messageId: 'missingCommentJsx', data: { component: 'Plural' } }],
    },
    {
      name: 'reports <Select> without a comment',
      code: '<Select value={gender} _male="His book" other="Their book" />',
      errors: [{ messageId: 'missingCommentJsx', data: { component: 'Select' } }],
    },
    {
      name: 'reports <SelectOrdinal> without a comment',
      code: '<SelectOrdinal value={count} one="#st" other="#th" />',
      errors: [{ messageId: 'missingCommentJsx', data: { component: 'SelectOrdinal' } }],
    },
    {
      name: 'reports only the outermost macro of a message',
      code: '<Trans>You have <Plural value={count} one="# task" other="# tasks" /></Trans>',
      errors: [{ messageId: 'missingCommentJsx', data: { component: 'Trans' } }],
    },

    // Macro calls
    {
      name: 'reports t() without a comment',
      code: 't({ message: "Hello" })',
      errors: [{ messageId: 'missingCommentCall' }],
    },
    {
      name: 'reports msg() without a comment',
      code: 'msg({ message: "Hello" })',
      errors: [{ messageId: 'missingCommentCall' }],
    },
    {
      name: 'reports defineMessage() without a comment',
      code: 'defineMessage({ id: "msg.hello", message: "Hello" })',
      errors: [{ messageId: 'missingCommentCall' }],
    },

    // Tagged templates can't carry a comment
    {
      name: 'reports t`...` outside of a directive',
      code: 't`Hello`',
      errors: [{ messageId: 'missingCommentTaggedTemplate', data: { fn: 't' } }],
    },
    {
      name: 'reports msg`...` outside of a directive',
      code: 'msg`Hello`',
      errors: [{ messageId: 'missingCommentTaggedTemplate', data: { fn: 'msg' } }],
    },
    {
      name: 'reports defineMessage`...` outside of a directive',
      code: 'defineMessage`Hello`',
      errors: [{ messageId: 'missingCommentTaggedTemplate', data: { fn: 'defineMessage' } }],
    },
    {
      name: 'reports a tagged template with nested template literals once',
      code: 't`Hello ${`world`}`',
      errors: [{ messageId: 'missingCommentTaggedTemplate' }],
    },

    // Comments without content
    {
      name: 'reports an empty comment',
      code: '<Trans comment="">Hello</Trans>',
      errors: [{ messageId: 'emptyComment' }],
    },
    {
      name: 'reports a blank comment',
      code: '<Trans comment="   ">Hello</Trans>',
      errors: [{ messageId: 'emptyComment' }],
    },
    {
      name: 'reports an empty comment property',
      code: 't({ message: "Hello", comment: "" })',
      errors: [{ messageId: 'emptyComment' }],
    },
    {
      name: 'reports an empty comment even when a directive is in effect',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = <Trans comment="">Order summary</Trans>
      `,
      errors: [{ messageId: 'emptyComment' }],
    },

    // Comments that only carry metadata
    {
      name: 'reports a component comment that only carries metadata',
      code: '<Trans comment="[CHAR_LIMIT=40]">Login</Trans>',
      options: ignoreMetadata,
      errors: [{ messageId: 'uninformativeComment', data: { patterns: '\\[[A-Z_]+=[^\\]]*\\]' } }],
    },
    {
      name: 'strips every match of a pattern',
      code: '<Trans comment="[CHAR_LIMIT=40] [SCREENSHOT=login]">Login</Trans>',
      options: ignoreMetadata,
      errors: [{ messageId: 'uninformativeComment' }],
    },
    {
      name: 'reports a macro call comment that only carries metadata',
      code: 't({ message: "Login", comment: "[CHAR_LIMIT=40]" })',
      options: ignoreMetadata,
      errors: [{ messageId: 'uninformativeComment' }],
    },
    {
      name: 'reports a macro described by a directive comment that only carries metadata',
      code: `
        // lingui-set comment="[CHAR_LIMIT=40]"
        const title = t\`Order summary\`
      `,
      options: ignoreMetadata,
      errors: [{ messageId: 'missingCommentTaggedTemplate' }],
    },

    // Directives that don't provide a comment
    {
      name: 'reports a tagged template after a reset',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = t\`Order summary\`
        // lingui-reset
        const greeting = t\`Hello\`
      `,
      errors: [{ messageId: 'missingCommentTaggedTemplate' }],
    },
    {
      name: 'reports a component after a reset',
      code: `
        // lingui-set comment="Checkout page strings"
        const title = <Trans>Order summary</Trans>
        // lingui-reset
        const greeting = <Trans>Hello</Trans>
      `,
      errors: [{ messageId: 'missingCommentJsx' }],
    },
    {
      name: 'reports a macro whose directive comment was unset',
      code: `
        // lingui-set comment="Checkout page strings"
        // lingui-set comment=""
        const title = t\`Order summary\`
      `,
      errors: [{ messageId: 'missingCommentTaggedTemplate' }],
    },
    {
      name: 'reports a macro declared before its directive',
      code: `
        const title = t\`Order summary\`
        // lingui-set comment="Checkout page strings"
      `,
      errors: [{ messageId: 'missingCommentTaggedTemplate' }],
    },
    {
      name: 'reports a macro described by a malformed directive',
      code: `
        // lingui-set comment=Checkout
        const title = t\`Order summary\`
      `,
      errors: [{ messageId: 'missingCommentTaggedTemplate' }],
    },

    // context only counts when the rule is configured to allow it
    {
      name: 'reports a component with a context by default',
      code: '<Trans context="checkout">Order summary</Trans>',
      errors: [{ messageId: 'missingCommentJsx' }],
    },
    {
      name: 'reports a macro call with a context by default',
      code: 't({ message: "Order summary", context: "checkout" })',
      errors: [{ messageId: 'missingCommentCall' }],
    },
    {
      name: 'reports a macro described by a context directive by default',
      code: `
        // lingui-set context="checkout"
        const title = t\`Order summary\`
      `,
      errors: [{ messageId: 'missingCommentTaggedTemplate' }],
    },
    {
      name: 'reports an empty context when allowContext is enabled',
      code: '<Trans context="">Order summary</Trans>',
      options: [{ allowContext: true }],
      errors: [{ messageId: 'missingCommentJsx' }],
    },
    {
      name: 'reports a context without a value when allowContext is enabled',
      code: '<Trans context>Order summary</Trans>',
      options: [{ allowContext: true }],
      errors: [{ messageId: 'missingCommentJsx' }],
    },
  ],
})
