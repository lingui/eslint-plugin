# no-unlocalized-strings

Ensures that all string literals, templates, and JSX text are wrapped using `<Trans>`, `t`, or `msg` for localization.

> [!IMPORTANT]  
> This rule may require TypeScript type information. Enable this feature by setting `{ useTsTypes: true }`.

This rule is designed to **match all** JSXText, StringLiterals, and TmplLiterals, and then exclude some of them based on attributes, property names, variable names, and so on.

The rule doesn’t come with built-in ignore settings because each project is unique and needs different configurations. You can use the following config as a starting point and then adjust it for your project:

<!-- prettier-ignore -->
```json5
{
  "no-unlocalized-strings": [
    "error",
    {
      "ignore": [
        // Ignore strings that don’t start with an uppercase letter
        //   or don't contain two words separated by whitespace
        "^(?![A-Z].*|\\w+\\s\\w+).+$",
        // Ignore UPPERCASE literals
        // Example: const test = "FOO"
        "^[A-Z0-9_-]+$"
      ],
      "ignoreNames": [
        // Ignore matching className (case-insensitive)
        { "regex": { "pattern": "className", "flags": "i" } },
        // Ignore UPPERCASE names
        // Example: test.FOO = "ola!"
        { "regex": { "pattern": "^[A-Z0-9_-]+$" } },
        "styleName",
        "src",
        "srcSet",
        "type",
        "id",
        "width",
        "height",
        "displayName",
        "Authorization"
      ],
      "ignoreFunctions": [
        "cva",
        "cn",
        "track",
        "Error",
        "console.*",
        "*headers.set",
        "*.addEventListener",
        "*.removeEventListener",
        "*.postMessage",
        "*.getElementById",
        "*.dispatch",
        "*.commit",
        "*.includes",
        "*.indexOf",
        "*.endsWith",
        "*.startsWith",
        "require"
      ],
      // Following settings require typed linting https://typescript-eslint.io/getting-started/typed-linting/
      "useTsTypes": true,
      "ignoreMethodsOnTypes": [
        // Ignore specified methods on Map and Set types
        "Map.get",
        "Map.has",
        "Set.has"
      ]
    }
  ]
}
```

## Options

### `useTsTypes`

Enables the rule to use TypeScript type information. Requires [typed linting](https://typescript-eslint.io/getting-started/typed-linting/) to be configured.

### `ignore`

Specifies patterns for string literals to ignore. Strings matching any of the provided regular expressions will not trigger the rule.

Example for `{ "ignore": ["rgba"] }`:

```jsx
/*eslint lingui/no-unlocalized-strings: ["error", {"ignore": ["rgba"]}]*/
const color = <div style={{ color: 'rgba(100, 100, 100, 0.4)' }} />
```

### `ignoreFunctions`

Specifies functions whose string arguments should be ignored.

Example of `correct` code with this option:

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunctions": ["showIntercomMessage"]}]*/
showIntercomMessage('Please write me')

/*eslint lingui/no-unlocalized-strings: ["error", { "ignoreFunctions": ["cva"] }]*/
const labelVariants = cva('text-form-input-content-helper', {
  variants: {
    size: {
      sm: 'text-sm leading-5',
      md: 'text-base leading-6',
    },
  },
})
```

This option also supports member expressions. Example for `{ "ignoreFunctions": ["console.log"] }`:

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunctions": ["console.log"]}]*/
console.log('Log this message')
```

You can use patterns (processed by [micromatch](https://www.npmjs.com/package/micromatch)) to match function calls.

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunctions": ["console.*"]}]*/
console.log('Log this message')
```

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunctions": ["*.headers.set"]}]*/
context.headers.set('Authorization', `Bearer ${token}`)
```

Dynamic segments are replaced with `$`, you can target them as

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunctions": ["foo.$.set"]}]*/
foo[getName()].set('Hello')
```

### `ignoreNames`

List of identifier names to ignore across attributes, properties, and variables. Use this option to exclude specific names, like "className", from being flagged by the rule. This option covers any of these contexts: JSX attribute names, variable names, or property names.

Example for `{ "ignoreNames": ["style"] }`:

Example of `correct` code with this option:

```jsx
/* eslint lingui/no-unlocalized-strings: ["error", {"ignoreNames": ["style"]}] */
// ignored by JSX sttribute name
const element = <div style={{ margin: '1rem 2rem' }} />
// ignored by variable name
const style = 'Ignored value!'

/* eslint lingui/no-unlocalized-strings: ["error", {"ignoreNames": ["displayName"]}] */
// ignored by property name
const obj = { displayName: 'Ignored value' }
obj.displayName = 'Ignored value'

class MyClass {
  displayName = 'Ignored value'
}
```

#### `regex`

Defines regex patterns for ignored names.

Example:

```json
{
  "no-unlocalized-strings": [
    "error",
    {
      "ignoreNames": [
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
// ignored by JSX attribute name
const element = <div wrapperClassName="absolute top-1/2 left-1/2" />

// ignored by variable name
const wrapperClassName = 'Ignored value'

// ignored by property name
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
