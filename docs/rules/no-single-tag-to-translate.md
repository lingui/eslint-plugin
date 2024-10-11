# no-single-tag-to-translate

> [!TIP]
> This rule is included into the `lingui/recommended` config

Ensures `<Trans></Trans>` isn't wrapping a single element unnecessarily

```jsx
// nope ⛔️
<Trans><strong>Foo bar</strong></Trans>

// ok ✅
<strong><Trans>Foo bar</Trans></strong>
```
