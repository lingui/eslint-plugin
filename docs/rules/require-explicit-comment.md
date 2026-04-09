# require-explicit-comment

Enforce that Lingui message declarations provide an explicit `comment` for translators, unless `context` is already provided.

Translator comments improve translation quality by giving additional intent about where and how a string is used.

Tagged template literals (`` t`Hello` ``) don't support `comment` - use the function call form instead.

```jsx
// nope ⛔️
<Trans>Hello</Trans>
<Plural value={count} one="# Book" other="# Books" />
t`Hello`
t({ message: "Hello" })

// ok ✅
<Trans comment="Homepage greeting">Hello</Trans>
<Plural value={count} one="# Book" other="# Books" comment="Book count label" />
<Select value={gender} _male="His book" _female="Her book" other="Their book" comment="Possessive pronoun" />
<SelectOrdinal value={count} one="#st" two="#nd" few="#rd" other="#th" comment="Ordinal suffix" />
t({ comment: "Homepage greeting", message: "Hello" })

// also ok ✅ (context exempts comment)
<Trans context="homepage">Hello</Trans>
t({ context: "homepage", message: "Hello" })
```

## What this rule checks

- `t({...})`, `msg({...})`, `defineMessage({...})`:
  - require `comment` if `context` is not present
- `<Trans />`, `<Plural />`, `<Select />`, `<SelectOrdinal />`:
  - require `comment` prop if `context` prop is not present
- `` t`...` ``, `` msg`...` ``, `` defineMessage`...` ``:
  - always invalid because tagged template form cannot carry `comment`

## Notes

- `comment` validation is presence-only: any value type is accepted (including expressions).
