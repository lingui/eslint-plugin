# require-explicit-id

Enforce that `<Trans>` components and Lingui macro function calls (`t`, `msg`, `defineMessage`) have an explicit `id`.

Providing an explicit `id` gives translators a stable, human-readable key and prevents auto-generated IDs from changing unexpectedly when the default message is updated.

Tagged template literals (`` t`Hello` ``) don't support `id` — use the function call form instead.

```jsx
// nope ⛔️
<Trans>Read the docs for more info.</Trans>
t`Hello`
t({ message: "Hello" })

// ok ✅
<Trans id="msg.docs">Read the docs for more info.</Trans>
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
