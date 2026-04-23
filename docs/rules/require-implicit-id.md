# require-implicit-id

Enforce that `<Trans>`, `<Plural>`, `<SelectOrdinal>`, `<Select>` components and Lingui macro function calls (`t`, `msg`, `defineMessage`) do not have an explicit `id`.

Relying on auto-generated IDs eliminates the need to maintain a separate mapping of IDs to messages and ensures the catalog stays in sync with the source code. See [Benefits of Generated IDs](https://lingui.dev/guides/explicit-vs-generated-ids#benefits-of-generated-ids) in the Lingui docs for more details.

> **⚠️ Conflicts:** This rule directly conflicts with [`require-explicit-id`](./require-explicit-id.md). Do **not** enable both rules at the same time — they are mutually exclusive.

```jsx
// nope ⛔️
<Trans id="msg.hello">Hello</Trans>
<Plural id="msg.books" value={count} one="# book" other="# books" />
t({ id: "msg.hello", message: "Hello" })

// ok ✅
<Trans>Hello</Trans>
<Plural value={count} one="# book" other="# books" />
t({ message: "Hello" })
t`Hello`
```
