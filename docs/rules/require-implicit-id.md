# require-implicit-id

Enforce that `<Trans>` components and Lingui macro function calls (`t`, `msg`, `defineMessage`) do not have an explicit `id`.

Relying on auto-generated IDs eliminates the need to maintain a separate mapping of IDs to messages and ensures the catalog stays in sync with the source code. See [Benefits of Generated IDs](https://lingui.dev/guides/explicit-vs-generated-ids#benefits-of-generated-ids) in the Lingui docs for more details.

> **⚠️ Conflicts:** This rule directly conflicts with [`require-explicit-id`](./require-explicit-id.md). Do **not** enable both rules at the same time — they are mutually exclusive.

```jsx
// nope ⛔️
<Trans id="msg.hello">Hello</Trans>
t({ id: "msg.hello", message: "Hello" })

// ok ✅
<Trans>Hello</Trans>
t({ message: "Hello" })
t`Hello`
```

## Options

### `requireContext`

Type: `boolean`
Default: `false`

When `true`, the rule additionally requires every translation to include a `context` property (for function calls) or attribute (for `<Trans>`). The `context` value helps translators disambiguate words or phrases that have the same default message but different meanings.

Tagged template literals (`` t`Hello` ``) don't support `context` — use the function call form instead.

### Configuration example

```jsonc
// Only forbid explicit id (default behavior)
"lingui/require-implicit-id": "error"

// Also require a context property on every translation
"lingui/require-implicit-id": ["error", { "requireContext": true }]
```

### Examples with `requireContext: true`

```jsx
// nope ⛔️
<Trans>Right</Trans>
t({ message: "right" })
t`right`

// ok ✅
<Trans context="direction">Right</Trans>
<Trans context="correctness">Right</Trans>
t({ message: "right", context: "direction" })
msg({ message: "right", context: "correctness" })
```

This is particularly useful for ambiguous terms:

```js
// "right" as a direction
const ex1 = msg({
  message: `right`,
  context: "direction",
});

// "right" as correctness
const ex2 = msg({
  message: `right`,
  context: "correctness",
});
```

