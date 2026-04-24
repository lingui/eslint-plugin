# no-macro-inside-macro

Don't nest Lingui translation macros.

Each Lingui translation macro — `` t` ` ``, `` msg` ` ``, `` defineMessage` ` `` and their call forms, plus the components `<Trans>`, `<Plural>`, `<Select>`, `<SelectOrdinal>` — extracts as a **standalone translation unit**. A standalone unit can't be composed into another one: the inner macro becomes an opaque expression at extract time, the outer message falls back to positional placeholders (`{0}`, `{1}`), and the `.po` file ends up with useless (sometimes enormous) placeholder comments.

Concretely, this rule forbids a translation macro inside any of:

- another message macro's template literal or message body (`` t`…${inner}…` ``, `t({ message: `…${inner}…` })`)
- a `<Plural>` / `<Select>` / `<SelectOrdinal>` branch attribute (excluding `value` / `offset`)
- a `plural()` / `select()` / `selectOrdinal()` option value (excluding `value` / `offset`)

Two exceptions — both legitimate composition, not nesting:

1. **Choice calls as interpolation**: `` t`${plural(n, { one: '…', other: '…' })}` `` composes the ICU plural into the outer message.
2. **Descriptor passthrough**: `t(msg`…`)` passes a lazy `MessageDescriptor` as a direct argument for translation.

## Examples

### ❌ Incorrect

```jsx
// message macro inside message macro
t`outer ${t`inner`}`

// component macro inside message macro
t`outer ${<Trans>inner</Trans>}`
t`outer ${<Plural value={n} one="a" other="b" />}`

// message macro inside choice component branch
<Plural
  value={count}
  one={t`# unread message`}
  other={t`# unread messages`}
/>

// component macro inside choice component branch
<Plural value={n} one={<Trans>a</Trans>} other="b" />

// message macro inside choice call option
plural(count, {
  one: t`# unread message`,
  other: t`# unread messages`,
})

// component macro inside choice call option
plural(count, {
  one: <Trans>a</Trans>,
  other: <Trans>b</Trans>,
})

// lazy macro interpolated (not a direct arg) still stringifies as [object Object]
t`Greeting: ${msg`Hello`}`
```

### ✅ Correct

```jsx
// Hoist and interpolate plain values
const inner = t`inner`
t`outer ${inner}`

// Branches extract themselves — use plain strings
<Plural
  value={count}
  one="# unread message"
  other="# unread messages"
/>

plural(count, {
  one: '# unread message',
  other: '# unread messages',
})

// Choice calls *as interpolation* inside a message macro compose into ICU
t`You have ${plural(count, { one: '# unread message', other: '# unread messages' })}`

// Descriptor passthrough: lazy macro as a direct argument to t()
const greeting = msg`Hello`
t(greeting)
t(msg`Hello`)
```

## When Not To Use It

There's no legitimate reason to nest translation macros outside of the two composition patterns above — leave the rule enabled.

## Performance

The rule fires only on nodes named `t` / `msg` / `defineMessage` (tagged-template or call) and JSX elements named `Trans` / `Plural` / `Select` / `SelectOrdinal` — name-filtered at the selector level, so non-matches never enter the handler. For each match the rule walks up the AST to the nearest containing Lingui macro (typically 1–5 hops) or to the program root. Linear in AST depth, no memoization, no quadratic paths. IIFE-bridged nesting (e.g. `<Plural one={(() => t`…`)()}`) is intentionally detected — the walk does not stop at function boundaries.

## Related

- [`no-expression-in-message`](./no-expression-in-message.md) — member expressions and function calls inside message interpolations.
- [`no-plural-inside-trans`](./no-plural-inside-trans.md) — `<Plural>` inside `<Trans>`.
- [`no-trans-inside-trans`](./no-trans-inside-trans.md) — `<Trans>` inside `<Trans>`.
