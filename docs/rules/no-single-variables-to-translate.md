# no-single-variables-to-translate

> [!TIP]
> This rule is included into the `lingui/recommended` config

Doesn't allow single variables without text to translate like `<Trans>{variable}</Trans>` or `` t`${variable}` ``

Such expression would pollute message catalog with useless string which has nothing to translate.

```jsx
// nope ⛔️
<Trans>{user}</Trans>

// ok ✅
<Trans>Hello {user}</Trans>
```
