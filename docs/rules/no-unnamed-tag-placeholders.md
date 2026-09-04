# no-unnamed-tag-placeholders

Enforce that JSX tags inside `<Trans>` use named placeholders (via [`jsxPlaceholderDefaults`](https://lingui.dev/ref/conf#macrojsxplaceholderdefaults)
or [`jsxPlaceholderAttribute`](https://lingui.dev/ref/conf#macrojsxplaceholderattribute)) to avoid generating numbered placeholders like `<0>`.

Much like [`no-expression-in-message`](./no-expression-in-message.md) prevents numbered variable placeholders (`{0}`) by requiring named variables or explicit labels, this rule prevents numbered tag placeholders (`<0>`) by ensuring all JSX elements within `<Trans>` have a named placeholder assigned.

Numbered placeholders like `<0>here</0>` deprive translators of critical context regarding what those tags represent (such as whether a tag is a link, bold text, or a button).

## Rule Details

All JSX elements inside `<Trans>` must either:

1. Match a configured element in `jsxPlaceholderDefaults` (e.g., `<a>`, `<em>`, `<strong>`).
2. Use the placeholder attribute configured by `jsxPlaceholderAttribute` (e.g., `<Link _t="nav_link">`).

If an element satisfies neither condition, a lint warning is reported.

### Examples of **invalid** code with this rule:

```jsx
// invalid ⛔
<Trans>
  Click <a href="/home">here</a> {/* extracts as 'Click <0>here</0>' */}
</Trans>

<Trans>
  Welcome <Link to="/profile">Profile</Link> {/* extracts as 'Welcome <0>Profile</0>' */}
</Trans>

<Trans>
  {/* Empty or boolean placeholder attributes */}
  <a _t="" href="/home">here</a>
  <Link _t to="/profile">Profile</Link>
</Trans>
```

### Examples of **valid** code with this rule:

```jsx
// valid ✅ (with jsxPlaceholderDefaults: { a: 'link' } and jsxPlaceholderAttribute: '_t')

<Trans>
  {/* Matches jsxPlaceholderDefaults */}
  Click <a href="/home">here</a> {/* extracts as 'Click <link>here</link>' */}
</Trans>

<Trans>
  {/* Uses explicit jsxPlaceholderAttribute */}
  Welcome <Link _t="profile_link" to="/profile">Profile</Link> {/* extracts as 'Welcome <profile_link>Profile</profile_link>' */}
</Trans>

<Trans>
  {/* Explicit attribute overrides defaults */}
  Click <a _t="docs_link" href="/docs">here</a> {/* extracts as 'Click <docs_link>here</docs_link>' */}
</Trans>

<Trans>
  {/* Elements passed as prop values are ignored */}
  <Button _t="submit_btn" icon={<Icon />}>Submit</Button>
</Trans>
```

## Options

This rule accepts an options object with the following properties:

### `jsxPlaceholderAttribute`

Type: `string`
Default: `undefined`

The JSX attribute name used to assign an explicit placeholder name to a JSX element inside `<Trans>`.

### `jsxPlaceholderDefaults`

Type: `Record<string, string> | string[]`
Default: `undefined`

A mapping of JSX element tag names to default placeholder names (mirrors `macro.jsxPlaceholderDefaults` from `lingui.config`).

An array of tag names (`string[]`) is also accepted as a shorthand in ESLint configs since the linter only needs to verify whether a tag is permitted. When a tag name matches, it does not require an explicit placeholder attribute.

## Configuration Examples

### Flat Config (`eslint.config.js`)

```js
import linguiPlugin from 'eslint-plugin-lingui'

export default [
  {
    plugins: {
      lingui: linguiPlugin,
    },
    rules: {
      'lingui/no-unnamed-tag-placeholders': [
        'warn',
        {
          jsxPlaceholderAttribute: '_t',
          jsxPlaceholderDefaults: {
            a: 'link',
            em: 'emphasis',
            strong: 'bold',
          },
        },
      ],
    },
  },
]
```

### Importing from `lingui.config.ts`

You can share the exact same configuration between Lingui and ESLint without adding any Lingui dependencies to ESLint:

```ts
import linguiPlugin from 'eslint-plugin-lingui'
import linguiConfig from './lingui.config'

export default [
  {
    plugins: {
      lingui: linguiPlugin,
    },
    rules: {
      'lingui/no-unnamed-tag-placeholders': [
        'warn',
        {
          jsxPlaceholderAttribute: linguiConfig.macro?.jsxPlaceholderAttribute,
          jsxPlaceholderDefaults: linguiConfig.macro?.jsxPlaceholderDefaults,
        },
      ],
    },
  },
]
```
