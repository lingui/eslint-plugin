# no-unlocalized-strings

Check that code doesn't contain strings/templates/jsxText what should be wrapped into `<Trans>` or `i18n`

> [!IMPORTANT]  
> This rule might use type information. You can enable it with `{useTsTypes: true}`

## Options

### useTsTypes

Use additional TypeScript type information. Requires [typed linting](https://typescript-eslint.io/getting-started/typed-linting/) to be setup.

Will automatically exclude some built-in methods such as `Map` and `Set`, and also cases where a string literal is used as a TypeScript constant:

```ts
const a: 'abc' = 'abc'
```

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

/*eslint lingui/no-unlocalized-strings: ["error", { "ignoreFunction": ["cva"] }]*/
const labelVariants = cva('text-form-input-content-helper', {
  variants: {
    size: {
      sm: 'text-sm leading-5',
      md: 'text-base leading-6',
    },
  },
})
```

### ignoreAttribute

The `ignoreAttribute` option specifies exceptions not to check for JSX attributes that match one of ignored attributes.

Examples of correct code for the `{ "ignoreAttribute": ["style"] }` option:

```jsx
/*eslint lingui/no-unlocalized-strings: ["error", { "ignoreAttribute": ["style"] }]*/
const element = <div style={{ margin: '1rem 2rem' }} />
```

By default, the following attributes are ignored: `className`, `styleName`, `type`, `id`, `width`, `height`

### strictAttribute

The `strictAttribute` option specifies JSX attributes which will always be checked regardless of `ignore`
option or any built-in exceptions.

Examples of incorrect code for the `{ "strictAttribute": ["alt"] }` option:

```jsx
/*eslint lingui/no-unlocalized-strings: ["error", { "strictAttribute": ["alt"] }]*/
const element = <div alt="IMAGE" />
```

### ignoreProperty

The `ignoreProperty` option specifies property names not to check.

Examples of correct code for the `{ "ignoreProperty": ["myProperty"] }` option:

```jsx
const test = { myProperty: 'This is ignored' }
object.MyProperty = 'This is ignored'
```

By default, the following properties are ignored: `className`, `styleName`, `type`, `id`, `width`, `height`, `displayName`

### ignoreMethodsOnTypes

Leverage the power of TypeScript to exclude methods defined on specific types.

Note: You must set `useTsTypes: true` to use this option.

The method to be excluded is defined as a `Type.method`. The type and method match by name here.

Examples of correct code for the `{ "ignoreMethodsOnTypes": ["Foo.bar"], "useTsTypes": true }` option:

```ts
interface Foo {
  get: (key: string) => string
}

const foo: Foo

foo.get('string with a spaces')
```

The following methods are ignored by default: `Map.get`, `Map.has`, `Set.has`.
