# require-trans-id

Enforce that `<Trans>` components have an explicit `id` attribute.

Providing an explicit `id` gives translators a stable, human-readable key and prevents auto-generated IDs from changing unexpectedly when the default message is updated.

```jsx
// nope ⛔️
<Trans>Read the <a href="https://lingui.dev">documentation</a> for more info.</Trans>

// ok ✅
<Trans id="msg.docs">Read the <a href="https://lingui.dev">documentation</a> for more info.</Trans>
```

## Options

### `patterns`

Type: `string[]` (array of regex patterns)
Default: _none_

When provided, the rule additionally validates that the `id` value matches at least one of the given regular expressions. If the option is omitted, any `id` value is accepted.

Non-string `id` values (e.g. JSX expressions like `id={someVar}`) are silently ignored during pattern validation.

### `flags`

Type: `string` (regex flags, e.g. `"i"` for case-insensitive)
Default: _none_

Optional flags passed to the `RegExp` constructor together with each pattern.

### Configuration example

```jsonc
// Only require id to be present (default behavior)
"lingui/require-trans-id": "error"

// Require id to match a specific pattern
"lingui/require-trans-id": ["error", { "patterns": ["^[\\w-]+$"] }]

// Require id to start with "msg." or "err."
"lingui/require-trans-id": ["error", { "patterns": ["^msg\\.", "^err\\."] }]

// Require id to start with "msg." (case-insensitive)
"lingui/require-trans-id": ["error", { "patterns": ["^msg\\."], "flags": "i" }]
```

### Examples with `patterns: ["^msg\\."]`

```jsx
// nope ⛔️
<Trans id="hello">Hello</Trans>

// ok ✅
<Trans id="msg.hello">Hello</Trans>
```
