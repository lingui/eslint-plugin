# require-comment

Enforce that `<Trans>`, `<Plural>`, `<SelectOrdinal>`, `<Select>` components and Lingui macro function calls (`t`, `msg`, `defineMessage`) describe their message to translators.

The same source string can have genuinely different correct translations depending on where it appears: "Save" in a settings panel, a payment form, and a destructive-action confirmation dialog may all translate differently. Without a comment, translators (human or AI) are left guessing from the string alone. See [comment](https://lingui.dev/ref/macro#comment) in the Lingui docs for more details.

The requirement is satisfied either by the macro itself or by a [`lingui-set` directive](https://lingui.dev/ref/macro#lingui-directive) in effect, which is the only option for tagged template literals (`` t`Hello` ``) since they can't carry a `comment` of their own.

```jsx
// nope ⛔️
<Trans>Order summary</Trans>
<Plural value={count} one="# book" other="# books" />
t({ message: "Order summary" })
t`Order summary`

// ok ✅
<Trans comment="Heading of the checkout page">Order summary</Trans>
<Plural value={count} one="# book" other="# books" comment="Books in the cart" />
t({ message: "Order summary", comment: "Heading of the checkout page" })

// also ok ✅ (a directive describes every message that follows it)
// lingui-set comment="Checkout page strings"
const title = t`Order summary`
const cta = t`Complete purchase`
// lingui-reset
```

## Rule Details

A `comment` that is present but blank is reported too, as it tells translators nothing:

```jsx
// nope ⛔️
<Trans comment="">Order summary</Trans>
<Trans comment="   ">Order summary</Trans>
```

Values that can only be known at runtime, such as `comment={hint}` or `comment: buildHint()`, are trusted: the rule checks that a comment is provided, and validates its content only when it can be resolved statically.

Macros nested in another macro are part of the message of their parent, so only the outermost one is reported:

```jsx
// ok ✅
<Trans comment="Tasks left in the list">
  You have <Plural value={count} one="# task" other="# tasks" />
</Trans>
```

## Options

### `ignorePatterns`

Type: `string[]` (array of regex patterns)
Default: _none_

Some translation systems read metadata tags out of the comment, for example a character budget or a screenshot reference. Matches of these patterns are stripped from a comment before the rule checks that a description is left, so that metadata alone doesn't pass as context for translators.

```jsx
// with ignorePatterns: ["\\[[A-Z_]+=[^\\]]*\\]"]

// nope ⛔️ (nothing but metadata)
<Trans comment="[CHAR_LIMIT=40]">Login</Trans>
<Trans comment="[CHAR_LIMIT=40] [SCREENSHOT=login]">Login</Trans>

// ok ✅
<Trans comment="[CHAR_LIMIT=40] Label of the login button">Login</Trans>
```

The patterns are applied to comments coming from a `lingui-set` directive as well.

### `flags`

Type: `string` (regex flags, e.g. `"i"` for case-insensitive)
Default: _none_

Optional flags passed to the `RegExp` constructor together with each pattern. The global flag is always applied, so that every match of a pattern is stripped rather than only the first one.

### `allowContext`

Type: `boolean`
Default: `false`

Whether a `context` value is an acceptable substitute for a `comment`. A `context` is primarily a disambiguation key, but it is extracted alongside the message and does give translators a hint, so teams that always provide one may prefer not to require a comment on top of it.

```jsx
// with allowContext: true

// ok ✅
;<Trans context="checkout">Order summary</Trans>
t({ message: 'Order summary', context: 'checkout' })

// lingui-set context="checkout"
const cta = t`Complete purchase`
// lingui-reset
```

A blank `context` never satisfies the rule.

### Configuration example

```jsonc
// Require a comment on every message (default behavior)
"lingui/require-comment": "error"

// Ignore metadata tags such as [CHAR_LIMIT=40] when checking that a comment is descriptive
"lingui/require-comment": ["error", { "ignorePatterns": ["\\[[A-Z_]+=[^\\]]*\\]"] }]

// Accept `context` instead of `comment`
"lingui/require-comment": ["error", { "allowContext": true }]
```

## Limitations

Messages written with an explicit i18n instance, `` t(i18n)`Order summary` `` and `t(i18n)({ message: 'Order summary' })`, are not checked. The rule only matches macros called as a bare identifier, which is a limitation it shares with the other rules of this plugin.

The `useLingui()` form is unaffected, since `t` stays a plain identifier:

```jsx
const { t } = useLingui()
// nope ⛔️ (reported as expected)
const title = t`Order summary`
```

## Related rules

- [`require-directive-reset`](./require-directive-reset.md) keeps the scope of a `lingui-set` directive explicit, which is worth enabling alongside this rule when directives are used to satisfy it.
