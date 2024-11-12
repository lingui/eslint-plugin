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
      "useTsTypes": true,
      "ignore": [
        // Ignore strings that don’t start with an uppercase letter
        //   or don't contain two words separated by whitespace
        "^(?![A-Z].*|\\w+\\s\\w+).+$",
        // Ignore UPPERCASE literals
        // Example: const test = "FOO"
        "^[A-Z_-]+$"
      ],
      "ignoreAttribute": [
        // Ignore attributes matching className (case-insensitive)
        { "regex": { "pattern": "className", "flags": "i" } },
        "styleName",
        "src",
        "srcSet",
        "type",
        "id",
        "width",
        "height"
      ],
      "ignoreProperty": [
        // Ignore properties matching className (case-insensitive)
        { "regex": { "pattern": "className", "flags": "i" } },
        "styleName",
        "type",
        "id",
        "width",
        "height",
        "displayName",
        "Authorization",
        // Ignore UPPERCASE properties
        // Example: test.FOO = "ola!"
        { "regex": { "pattern": "^[A-Z_-]+$" } }
      ],
      "ignoreFunction": [
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
      "ignoreVariable": [
        // Ignore literals assigned to variables with UPPERCASE names
        // Example: const FOO = "Ola!"
        { "regex": { "pattern": "^[A-Z_-]+$" } }
      ],
      "ignoreMethodsOnType": [
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

You can use patterns (processed by [micromatch](https://www.npmjs.com/package/micromatch)) to match function calls.

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunction": ["console.*"]}]*/
console.log('Log this message')
```

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunction": ["*.headers.set"]}]*/
context.headers.set('Authorization', `Bearer ${token}`)
```

Dynamic segments are replaced with `$`, you can target them as

```js
/*eslint lingui/no-unlocalized-strings: ["error", {"ignoreFunction": ["foo.$.set"]}]*/
foo[getName()].set('Hello')
```

### `ignoreAttribute`

Specifies JSX attributes that should be ignored.

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

Specifies object property names whose values should be ignored.

Example for `{ "ignoreProperty": ["displayName"] }`:

```jsx
const obj = { displayName: 'Ignored value' }
obj.displayName = 'Ignored value'

class MyClass {
  displayName = 'Ignored value'
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

### `ignoreVariable`

Specifies variable name whose values should be ignored.

Example for `{ "ignoreVariable": ["myVariable"] }`:

```jsx
const myVariable = 'Ignored value'
```

#### `regex`

Defines regex patterns for ignored variables.

Example:

```json
{
  "no-unlocalized-strings": [
    "error",
    {
      "ignoreVariable": [
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
const wrapperClassName = 'Ignored value'
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
