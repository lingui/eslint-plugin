# no-single-variables-to-translate

> [!TIP]
> This rule is included into the `lingui/recommended` config

Doesn't allow single variables without text to translate like `<Trans>{variable}</Trans>` or `` t`${variable}` ``

Such expression would pollute message catalog with useless string which has nothing to translate.

Examples of invalid code with this rule:

```jsx
// invalid ⛔️
;<Trans>{user}</Trans>
t`${user}`
msg`${user}`
```

Examples of valid code with this rule:

```jsx
// valid ✅
;<Trans>Hello {user}</Trans>
t`Hello ${user}`
msg`Hello ${user}`
```
