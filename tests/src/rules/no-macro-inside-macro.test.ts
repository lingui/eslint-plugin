import { rule, name } from '../../../src/rules/no-macro-inside-macro'
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
    // ==================== Plain message macros ====================
    {
      name: 'allows t`` with identifier interpolation',
      code: 't`Hello ${name}`',
    },
    {
      name: 'allows msg`` with identifier interpolation',
      code: 'msg`Hello ${name}`',
    },
    {
      name: 'allows defineMessage`` with identifier interpolation',
      code: 'defineMessage`Hello ${name}`',
    },
    {
      name: 'allows t() with message option as template literal',
      code: 't({ message: `Hello ${name}` })',
    },

    // ==================== Choice calls as template interpolation ====================
    // plural()/select()/selectOrdinal() inside a message macro template compose
    // into ICU; they are not nested translation units.
    {
      name: 'allows plural() interpolated into t`` template',
      code: 't`${plural(count, { one: "# book", other: "# books" })}`',
    },
    {
      name: 'allows select() interpolated into t`` template',
      code: 't`${select(gender, { male: "he", female: "she", other: "they" })}`',
    },
    {
      name: 'allows selectOrdinal() interpolated into t`` template',
      code: 't`${selectOrdinal(n, { one: "#st", other: "#th" })}`',
    },

    // ==================== Lazy descriptor passthrough ====================
    // msg/defineMessage produce MessageDescriptor values; passing them as a
    // direct argument to t() is the canonical passthrough pattern.
    {
      name: 'allows msg`` as direct argument to t()',
      code: 't(msg`Hello`)',
    },
    {
      name: 'allows defineMessage`` as direct argument to t()',
      code: 't(defineMessage`Hello`)',
    },
    {
      name: 'allows msg() call form as direct argument to t()',
      code: 't(msg({ id: "greeting", message: "Hello" }))',
    },

    // ==================== Plain choice components ====================
    {
      name: 'allows <Plural> with plain string branches',
      code: '<Plural value={count} one="# book" other="# books" />',
    },
    {
      name: 'allows <Select> with plain string branches',
      code: '<Select value={gender} male="he" female="she" other="they" />',
    },
    {
      name: 'allows <SelectOrdinal> with plain string branches',
      code: '<SelectOrdinal value={n} one="#st" other="#th" />',
    },

    // ==================== Plain choice calls ====================
    {
      name: 'allows plural() with plain string options',
      code: 'plural(count, { one: "# book", other: "# books" })',
    },
    {
      name: 'allows select() with plain string options',
      code: 'select(gender, { male: "he", female: "she", other: "they" })',
    },
    {
      name: 'allows selectOrdinal() with plain string options',
      code: 'selectOrdinal(n, { one: "#st", other: "#th" })',
    },

    // ==================== value / offset positions are unrestricted ====================
    {
      name: 'allows macro expression in <Plural> value attribute',
      code: '<Plural value={t`dynamic`.length} one="a" other="b" />',
    },
    {
      name: 'allows any expression in plural() offset option',
      code: 'plural(count, { offset: someFn(), one: "a", other: "b" })',
    },

    // ==================== Same name, not a macro ====================
    {
      name: 'ignores member-access tagged template (obj.t`...`)',
      code: 'obj.t`Hello`',
    },
    {
      name: 'ignores member-access plural() call',
      code: 'obj.plural(n, { one: t`x`, other: t`y` })',
    },
    {
      name: 'ignores local identifier shadowing `t`',
      code: 'const notMacro = t => t`ok`; notMacro()',
    },

    // ==================== Top-level component macros ====================
    {
      name: 'allows top-level <Trans> with identifier interpolation',
      code: '<Trans>Hello {userName}</Trans>',
    },
    {
      name: 'allows top-level <Plural>',
      code: '<Plural value={count} one="# book" other="# books" />',
    },
    {
      name: 'allows top-level <Select>',
      code: '<Select value={gender} male="he" female="she" other="they" />',
    },
    {
      name: 'allows top-level <SelectOrdinal>',
      code: '<SelectOrdinal value={n} one="#st" other="#th" />',
    },
  ],
  invalid: [
    // ==================== Eager message macro inside another message macro ====================
    {
      name: 'flags t`` inside t`` template',
      code: 't`outer ${t`inner`}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 't', outer: 't' } }],
    },
    {
      name: 'flags t`` inside msg`` template',
      code: 'msg`outer ${t`inner`}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 't', outer: 'msg' } }],
    },
    {
      name: 'flags t`` inside defineMessage`` template',
      code: 'defineMessage`outer ${t`inner`}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 't', outer: 'defineMessage' } }],
    },
    {
      name: 'flags t`` inside t() message option template',
      code: 't({ message: `outer ${t`inner`}` })',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 't', outer: 't' } }],
    },
    {
      name: 'flags t() call inside t() message option template',
      code: 't({ message: `outer ${t({ message: "inner" })}` })',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 't', outer: 't' } }],
    },
    {
      name: 'reports each nested macro independently',
      code: 't`a ${t`b`} c ${t`d`}`',
      errors: [
        { messageId: 'insideMessageMacro', data: { inner: 't', outer: 't' } },
        { messageId: 'insideMessageMacro', data: { inner: 't', outer: 't' } },
      ],
    },

    // ==================== Lazy message macro interpolated, not passed through ====================
    // Interpolation stringifies a MessageDescriptor as [object Object] at runtime.
    {
      name: 'flags msg`` interpolated into t`` template',
      code: 't`Greeting: ${msg`Hello`}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'msg', outer: 't' } }],
    },
    {
      name: 'flags defineMessage`` interpolated into msg`` template',
      code: 'msg`Greeting: ${defineMessage`Hello`}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'defineMessage', outer: 'msg' } }],
    },
    {
      name: 'flags msg`` as message property (not a direct argument)',
      code: 't({ message: msg`Hello` })',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'msg', outer: 't' } }],
    },

    // ==================== Component macro inside a message macro ====================
    {
      name: 'flags <Trans> interpolated into t`` template',
      code: 't`outer ${<Trans>inner</Trans>}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'Trans', outer: 't' } }],
    },
    {
      name: 'flags <Plural> interpolated into t`` template',
      code: 't`outer ${<Plural value={n} one="a" other="b" />}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'Plural', outer: 't' } }],
    },
    {
      name: 'flags <Select> interpolated into t`` template',
      code: 't`outer ${<Select value={g} male="a" other="b" />}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'Select', outer: 't' } }],
    },
    {
      name: 'flags <SelectOrdinal> interpolated into t`` template',
      code: 't`outer ${<SelectOrdinal value={n} one="a" other="b" />}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'SelectOrdinal', outer: 't' } }],
    },
    {
      name: 'flags <Trans> interpolated into msg`` template',
      code: 'msg`outer ${<Trans>inner</Trans>}`',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'Trans', outer: 'msg' } }],
    },
    {
      name: 'flags <Trans> interpolated into t() message option template',
      code: 't({ message: `outer ${<Trans>inner</Trans>}` })',
      errors: [{ messageId: 'insideMessageMacro', data: { inner: 'Trans', outer: 't' } }],
    },

    // ==================== Message macro inside a choice component branch ====================
    {
      name: 'flags t`` in <Plural> branches',
      code: '<Plural value={count} one={t`# unread message`} other={t`# unread messages`} />',
      errors: [
        { messageId: 'insideChoiceComponentBranch', data: { inner: 't', component: 'Plural', attr: 'one' } },
        { messageId: 'insideChoiceComponentBranch', data: { inner: 't', component: 'Plural', attr: 'other' } },
      ],
    },
    {
      name: 'flags msg`` in <Plural> branches',
      code: '<Plural value={count} one={msg`# unread message`} other={msg`# unread messages`} />',
      errors: [
        { messageId: 'insideChoiceComponentBranch', data: { inner: 'msg', component: 'Plural', attr: 'one' } },
        { messageId: 'insideChoiceComponentBranch', data: { inner: 'msg', component: 'Plural', attr: 'other' } },
      ],
    },
    {
      name: 'flags msg`` in <Select> branches',
      code: '<Select value={gender} male={msg`he`} female={msg`she`} other={msg`they`} />',
      errors: [
        { messageId: 'insideChoiceComponentBranch', data: { inner: 'msg', component: 'Select', attr: 'male' } },
        { messageId: 'insideChoiceComponentBranch', data: { inner: 'msg', component: 'Select', attr: 'female' } },
        { messageId: 'insideChoiceComponentBranch', data: { inner: 'msg', component: 'Select', attr: 'other' } },
      ],
    },
    {
      name: 'flags t`` in <SelectOrdinal> branches',
      code: '<SelectOrdinal value={n} one={t`#st`} other={t`#th`} />',
      errors: [
        { messageId: 'insideChoiceComponentBranch', data: { inner: 't', component: 'SelectOrdinal', attr: 'one' } },
        { messageId: 'insideChoiceComponentBranch', data: { inner: 't', component: 'SelectOrdinal', attr: 'other' } },
      ],
    },

    // ==================== Component macro inside a choice component branch ====================
    {
      name: 'flags <Trans> in a <Plural> branch',
      code: '<Plural value={n} one={<Trans>a</Trans>} other="b" />',
      errors: [{ messageId: 'insideChoiceComponentBranch', data: { inner: 'Trans', component: 'Plural', attr: 'one' } }],
    },
    {
      name: 'flags nested <Plural> in a <Plural> branch',
      code: '<Plural value={n} one={<Plural value={m} one="x" other="y" />} other="b" />',
      errors: [{ messageId: 'insideChoiceComponentBranch', data: { inner: 'Plural', component: 'Plural', attr: 'one' } }],
    },

    // ==================== Message macro inside a choice call option ====================
    {
      name: 'flags t`` in plural() options',
      code: 'plural(count, { one: t`# book`, other: t`# books` })',
      errors: [
        { messageId: 'insideChoiceCallOption', data: { inner: 't', call: 'plural', option: 'one' } },
        { messageId: 'insideChoiceCallOption', data: { inner: 't', call: 'plural', option: 'other' } },
      ],
    },
    {
      name: 'flags msg`` in select() options',
      code: 'select(gender, { male: msg`he`, female: msg`she`, other: msg`they` })',
      errors: [
        { messageId: 'insideChoiceCallOption', data: { inner: 'msg', call: 'select', option: 'male' } },
        { messageId: 'insideChoiceCallOption', data: { inner: 'msg', call: 'select', option: 'female' } },
        { messageId: 'insideChoiceCallOption', data: { inner: 'msg', call: 'select', option: 'other' } },
      ],
    },

    // ==================== Component macro inside a choice call option ====================
    {
      name: 'flags <Trans> in plural() options',
      code: 'plural(count, { one: <Trans>a</Trans>, other: <Trans>b</Trans> })',
      errors: [
        { messageId: 'insideChoiceCallOption', data: { inner: 'Trans', call: 'plural', option: 'one' } },
        { messageId: 'insideChoiceCallOption', data: { inner: 'Trans', call: 'plural', option: 'other' } },
      ],
    },
  ],
})
