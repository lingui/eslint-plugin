# require-trans-id

Enforce that `<Trans>` components have an explicit `id` attribute.

Providing an explicit `id` gives translators a stable, human-readable key and prevents auto-generated IDs from changing unexpectedly when the default message is updated.

```jsx
// nope ⛔️
<Trans>Read the <a href="https://lingui.dev">documentation</a> for more info.</Trans>

// ok ✅
<Trans id="msg.docs">Read the <a href="https://lingui.dev">documentation</a> for more info.</Trans>
```

