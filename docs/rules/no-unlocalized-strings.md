# no-unlocalized-strings

Ensures that all string literals, templates, and JSX text are wrapped using `<Trans>`, `t`, or `msg` for localization.

> [!IMPORTANT]  
> This rule may require TypeScript type information. Enable this feature by setting `{ useTsTypes: true }`.

## Options

### `useTsTypes`

Enables the rule to use TypeScript type information. Requires [typed linting](https://typescript-eslint.io/getting-started/typed-linting/) to be configured.

This option automatically excludes built-in methods such as `Map` and `Set`, and cases where string literals are used as TypeScript constants, e.g.:

```ts
const a: 'abc' = 'abc'
```

### `ignore`

Specifies patterns for string literals to ignore. Strings matching any of the provided regular expressions will not trigger the rule.

Example for `{ "ignore": ["rgba"] }`:

```jsx
/*eslint lingui/no-unlocalized-strings: ["error", {"ignore": ["rgba"]}]*/
const color = <div style={{ color: 'rgba(100, 100, 100, 0.4)' }} />
```

### `ignoreFunction`

Specifies functions whose string arguments should be ignored.

Example of `correct` code with this option:

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunction": ["showIntercomMessage"]}]*/
showIntercomMessage('Please write me')

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

This option also supports member expressions. Example for `{ "ignoreFunction": ["console.log"] }`:

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunction": ["console.log"]}]*/
console.log('Log this message')
```

> **Note:** Only single-level patterns are supported. For instance, `foo.bar.baz` will not be matched.

### `ignoreAttribute`

Specifies JSX attributes that should be ignored. By default, the attributes `className`, `styleName`, `type`, `id`, `width`, and `height` are ignored.

Example for `{ "ignoreAttribute": ["style"] }`:

```jsx
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreAttribute": ["style"]}]*/
const element = <div style={{ margin: '1rem 2rem' }} />
```

#### `regex`

Defines regex patterns for ignored attributes.

Example:

```json
{
  "no-unlocalized-strings": [
    "error",
    {
      "ignoreAttribute": [
        {
          "regex": {
            "pattern": "classname",
            "flags": "i"
          }
        }
      ]
    }
  ]
}
```

Example of **correct** code:

```jsx
const element = <div wrapperClassName="absolute top-1/2 left-1/2" />
```

### `strictAttribute`

Specifies JSX attributes that should always be checked, regardless of other `ignore` settings or defaults.

Example for `{ "strictAttribute": ["alt"] }`:

```jsx
/*eslint lingui/no-unlocalized-strings: ["error", {"strictAttribute": ["alt"]}]*/
const element = <img alt="IMAGE" />
```

#### `regex`

Defines regex patterns for attributes that must always be checked.

Example:

```json
{
  "no-unlocalized-strings": [
    "error",
    {
      "strictAttribute": [
        {
          "regex": {
            "pattern": "^desc.*"
          }
        }
      ]
    }
  ]
}
```

Examples of **incorrect** code:

```jsx
const element = <div description="IMAGE" />
```

### `ignoreProperty`

Specifies object property names whose values should be ignored. By default, UPPERCASED properties and `className`, `styleName`, `type`, `id`, `width`, `height`, and `displayName` are ignored.

Example for `{ "ignoreProperty": ["myProperty"] }`:

```jsx
const obj = { myProperty: 'Ignored value' }
obj.myProperty = 'Ignored value'

class MyClass {
  myProperty = 'Ignored value'
}
```

#### `regex`

Defines regex patterns for ignored properties.

Example:

```json
{
  "no-unlocalized-strings": [
    "error",
    {
      "ignoreProperty": [
        {
          "regex": {
            "pattern": "classname",
            "flags": "i"
          }
        }
      ]
    }
  ]
}
```

Examples of **correct** code:

```jsx
const obj = { wrapperClassName: 'Ignored value' }
obj.wrapperClassName = 'Ignored value'

class MyClass {
  wrapperClassName = 'Ignored value'
}
```

### `ignoreMethodsOnTypes`

Uses TypeScript type information to ignore methods defined on specific types.

Requires `useTsTypes: true`.

Specify methods as `Type.method`, where both the type and method are matched by name.

Example for `{ "ignoreMethodsOnTypes": ["Foo.get"], "useTsTypes": true }`:

```ts
interface Foo {
  get: (key: string) => string
}

const foo: Foo
foo.get('Some string')
```

The following methods are ignored by default: `Map.get`, `Map.has`, `Set.has`.
