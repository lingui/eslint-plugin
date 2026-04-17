# require-explicit-id

Enforce that `<Trans>`, `<Plural>`, `<SelectOrdinal>`, `<Select>` components and Lingui macro function calls (`t`, `msg`, `defineMessage`) have an explicit `id`.

Providing an explicit `id` gives translators a stable, human-readable key and prevents auto-generated IDs from changing unexpectedly when the default message is updated. See [Benefits of Explicit IDs](https://lingui.dev/guides/explicit-vs-generated-ids#benefits-of-explicit-ids) in the Lingui docs for more details.

Tagged template literals (`` t`Hello` ``) don't support `id` — use the function call form instead.

> **⚠️ Conflicts:** This rule directly conflicts with [`require-implicit-id`](./require-implicit-id.md). Do **not** enable both rules at the same time — they are mutually exclusive.

```jsx
// nope ⛔️
<Trans>Read the docs for more info.</Trans>
<Plural value={count} one="# book" other="# books" />
t`Hello`
t({ message: "Hello" })

// ok ✅
<Trans id="msg.docs">Read the docs for more info.</Trans>
<Plural id="msg.books" value={count} one="# book" other="# books" />
t({ id: "msg.hello", message: "Hello" })
```

## Options

### `patterns`

Type: `string[]` (array of regex patterns)
Default: _none_

When provided, the rule additionally validates that the `id` value matches at least one of the given regular expressions. If the option is omitted, any `id` value is accepted.

Non-string `id` values (e.g. JSX expressions like `id={someVar}` or `id: someVar`) are silently ignored during pattern validation.

### `flags`

Type: `string` (regex flags, e.g. `"i"` for case-insensitive)
Default: _none_

Optional flags passed to the `RegExp` constructor together with each pattern.

### Configuration example

```jsonc
// Only require id to be present (default behavior)
"lingui/require-explicit-id": "error"

// Require id to match a specific pattern
"lingui/require-explicit-id": ["error", { "patterns": ["^[\\w-]+$"] }]

// Require id to start with "msg." or "err."
"lingui/require-explicit-id": ["error", { "patterns": ["^msg\\.", "^err\\."] }]

// Require id to start with "msg." (case-insensitive)
"lingui/require-explicit-id": ["error", { "patterns": ["^msg\\."], "flags": "i" }]
```

### Examples with `patterns: ["^msg\\."]`

```jsx
// nope ⛔️
<Trans id="hello">Hello</Trans>
t({ id: "hello", message: "Hello" })

// ok ✅
<Trans id="msg.hello">Hello</Trans>
t({ id: "msg.hello", message: "Hello" })
```
