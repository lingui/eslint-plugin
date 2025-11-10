# no-nested-trans

Disallow nested translation functions and components.

Translation functions and components should not be nested inside each other. This includes:

- Tagged template expressions: `t```, `msg``, `defineMessage``
- Function calls: `t()`, `msg()`, `defineMessage()`, `plural()`, `select()`, `selectOrdinal()`
- JSX components: `<Trans>`, `<Plural>`, `<Select>`, `<SelectOrdinal>`

## Rule Details

This rule prevents nesting any translation function or component inside another translation function or component. Nested translations can lead to unexpected behavior and make code harder to maintain.

❌ Examples of **incorrect** code for this rule:

```tsx
// Tagged templates inside components
<Trans>{t`Hello`}</Trans>
<Plural value={count} one="one" other={t`${count} items`} />

// Function calls inside components
<Trans>{plural(count, { one: "one", other: "many" })}</Trans>
<Select value={gender} male={t({ message: "He" })} other="They" />

// Components inside components
<Trans><Plural value={count} one="one" other="many" /></Trans>
<Plural value={count} one={<Trans>one item</Trans>} other="many" />

// Function calls inside function calls
plural(count, {
  one: "one book",
  other: t`There are ${count} books`
})

select(gender, {
  male: plural(count, { one: "one", other: "many" }),
  other: "items"
})

// Nested tagged templates
t`Hello ${t`world`}`
msg`Hello ${plural(count, { one: "one", other: "many" })}`
```

✅ Examples of **correct** code for this rule:

```tsx
// Standalone usage
const message = t`Hello`
const books = plural(count, { one: "one book", other: "many books" })
const greeting = select(gender, { male: "He", female: "She", other: "They" })

// Components with static content
<Trans>There are many books</Trans>
<Plural value={count} one="one book" other="many books" />
<Select value={gender} male="He" female="She" other="They" />

// Components with variables and expressions (non-translation)
<Trans>{userName} has {bookCount} books</Trans>
<Plural value={count} one="one book" other={`${count} books`} />

// Adjacent usage (not nested)
<div>
  <Trans>Hello</Trans>
  <Plural value={count} one="one" other="many" />
</div>
```

## When Not To Use It

If you need to compose translations in complex ways, you might want to disable this rule. However, it's generally recommended to keep translations simple and avoid nesting.

## Further Reading

- [LinguiJS Translation Components](https://lingui.js.org/tutorials/react.html#rendering-translations)
- [LinguiJS Functions](https://lingui.js.org/ref/macro.html)
