# no-plural-inside-trans

Check that no `Plural` components are inside `Trans` components.

Placing `Plural` inside `Trans` components fragments the message and creates nested translation logic that makes messages harder for translation tooling and translators to handle. Pluralization should be the top-level translation unit, so translators can control the entire sentence and restructure the grammar as necessary.

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

### Exceptions

There are some edge cases where `Plural` inside `Trans` may be preferred. For instance, if the plural must appear inside structured markup that cannot be moved:

```jsx
<Trans>
  You have{' '}
  <strong>
    <Plural value={count} one="# unread message" other="# unread messages" />
  </strong>
  .
</Trans>
```
