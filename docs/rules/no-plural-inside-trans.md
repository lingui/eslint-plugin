# no-plural-inside-trans

Check that no `Plural` components are inside `Trans` components.

## Examples

### ❌ Incorrect

```jsx
<Trans>
  You have <Plural value={count} one="# unread message" other="# unread messages" />.
</Trans>
```

### ✅ Correct

```jsx
<Plural value={count} one="You have # unread message." other="You have # unread messages." />
```
