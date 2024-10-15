# no-expression-in-message

Check that `` t` ` `` doesn't contain member or function expressions like `` t`Hello ${user.name}` `` or `` t`Hello ${getName()}` ``

Such expressions would be transformed to its index position such as `Hello {0}` which gives zero to little context for translator.

Use a variable identifier instead.

Examples of invalid code with this rule:

```jsx
// invalid ⛔
t`Hello ${user.name}` // => 'Hello {0}'
msg`Hello ${user.name}` // => 'Hello {0}'
defineMessage`Hello ${user.name}` // => 'Hello {0}'
```

Examples of valid code with this rule:

```jsx
// valid ✅
const userName = user.name
t`Hello ${userName}` // => 'Hello {userName}'
msg`Hello ${userName}` // => 'Hello {userName}'
defineMessage`Hello ${userName}` // => 'Hello {userName}'
```
