# consistent-plural-format

Enforce consistent format for plural definitions in Lingui i18n library.

## Rule Details

This rule enforces a consistent format for plural definitions when using the `plural()` function or `<Plural>` component from Lingui. There are two supported formats:

1. **Hash format** (default): Uses `#` as a placeholder for the count
2. **Template format**: Uses template literals with explicit variable interpolation

The rule works with both:

- `plural()` function calls
- `<Plural>` React component attributes

## Options

This rule accepts an options object with the following properties:

- `style` (string): The preferred style for plural definitions. Can be either `"hash"` or `"template"`. Default is `"hash"`.

```json
{
  "lingui/consistent-plural-format": ["error", { "style": "hash" }]
}
```

## Examples

### ❌ Incorrect (when `style` is `"hash"` - default)

```js
plural(numBooks, {
  one: `${numBooks} book`,
  other: `${numBooks} books`,
})

plural(count, {
  zero: `${count} items`,
  one: '# item',
  other: `${count} items`,
})

// String with template literal pattern
plural(numBooks, {
  one: '${numBooks} book',
  other: '# books',
})
;<Plural
  value={messagesCount}
  one={`There's ${messagesCount} message in your inbox`}
  other={`There are ${messagesCount} messages in your inbox`}
/>
```

### ✅ Correct (when `style` is `"hash"` - default)

```js
plural(numBooks, {
  one: '# book',
  other: '# books',
})

plural(count, {
  zero: '# items',
  one: '# item',
  other: '# items',
})
;<Plural
  value={messagesCount}
  one="There's # message in your inbox"
  other="There are # messages in your inbox"
/>
```

### ❌ Incorrect (when `style` is `"template"`)

```js
plural(numBooks, {
  one: '# book',
  other: '# books',
})

plural(count, {
  zero: '# items',
  one: `${count} item`,
  other: '# items',
})
;<Plural
  value={messagesCount}
  one="There's # message in your inbox"
  other="There are # messages in your inbox"
/>
```

### ✅ Correct (when `style` is `"template"`)

```js
plural(numBooks, {
  one: `${numBooks} book`,
  other: `${numBooks} books`,
})

plural(count, {
  zero: `${count} items`,
  one: `${count} item`,
  other: `${count} items`,
})
;<Plural
  value={messagesCount}
  one={`There's ${messagesCount} message in your inbox`}
  other={`There are ${messagesCount} messages in your inbox`}
/>
```
