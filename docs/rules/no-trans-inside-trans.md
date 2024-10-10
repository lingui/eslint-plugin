# no-trans-inside-trans

> [!TIP]
> This rule is included into the `lingui/recommended` config

Check that no `Trans` inside `Trans` components.

```jsx
// nope ⛔️
<Trans>Hello <Trans>World!</Trans></Trans>

// ok ✅
<Trans>Hello World!</Trans>
```
