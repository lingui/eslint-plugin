# no-expression-in-message

Check that `` t` ` `` doesn't contain member or function expressions like `` t`Hello ${user.name}` `` or `` t`Hello ${getName()}` ``

Such expressions would be transformed to its index position such as `Hello {0}` which gives zero to little context for translator.

Use a variable identifier instead.

```jsx
// nope ⛔️
t`Hello ${user.name}` // => 'Hello {0}'

// ok ✅
const userName = user.name
t`Hello ${userName}` // => 'Hello {userName}'
```
