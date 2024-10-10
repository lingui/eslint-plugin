# no-unlocalized-strings

Check that code doesn't contain strings/templates/jsxText what should be wrapped into `<Trans>` or `i18n`

> [!IMPORTANT]  
> This rule might use type information. You can enable it with `{useTsTypes: true}`

## Options

### useTsTypes

Use additional Typescript type information. Requires [typed linting](https://typescript-eslint.io/getting-started/typed-linting/) to be setup.

### ignore

The `ignore` option specifies exceptions not to check for
literal strings that match one of regexp patterns.

Examples of correct code for the `{ "ignore": ["rgba"] }` option:

```jsx
/*eslint lingui/no-unlocalized-strings ["error", {"ignore": ["rgba"]}]*/
const a = <div color="rgba(100, 100, 100, 0.4)"></div>
```

### ignoreFunction

The `ignoreFunction` option specifies exceptions not check for
function calls whose names match one of regexp patterns.

Examples of correct code for the `{ "ignoreFunction": ["showIntercomMessage"] }` option:

```js
/*eslint lingui/no-unlocalized-strings: ["error", { "ignoreFunction": ["showIntercomMessage"] }]*/
const bar = showIntercomMessage('Please, write me')
```

### ignoreAttribute

The `ignoreAttribute` option specifies exceptions not to check for JSX attributes that match one of ignored attributes.

Examples of correct code for the `{ "ignoreAttribute": ["style"] }` option:

```jsx
/*eslint lingui/no-unlocalized-strings: ["error", { "ignoreAttribute": ["style"] }]*/
const element = <div style={{ margin: '1rem 2rem' }} />
```

By default, the following attributes are ignored: `className`, `styleName`, `type`, `id`, `width`, `height`

### ignoreProperty

The `ignoreProperty` option specifies property names not to check.

Examples of correct code for the `{ "ignoreProperty": ["text"] }` option:

```jsx
/*eslint lingui/no-unlocalized-strings: ["error", { "ignoreProperty": ["text"] }]*/
const test = { text: 'This is ignored' }
```

By default, the following properties are ignored: `className`, `styleName`, `type`, `id`, `width`, `height`
