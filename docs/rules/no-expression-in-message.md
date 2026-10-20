# no-expression-in-message

Ensure that every placeholder in a message has a meaningful name. Reports member expressions, function calls, and other complex expressions inside `` t` ` ``, `msg`, `defineMessage`, and `<Trans>`, such as `` t`Hello ${user.name}` `` or `<Trans>Hello {getName()}</Trans>`.

Lingui names a placeholder after the variable it interpolates, so `` t`Hello ${name}` `` is extracted as `Hello {name}`. Any other expression is extracted by its index, as `Hello {0}`, which gives translators and AI translation tools no information about what the value is.

## Rule Details

Wrap the expression in the [`ph`](https://lingui.dev/ref/macro#ph) macro to give the placeholder an explicit name. The key of the object becomes the placeholder name and the value is the expression:

```jsx
import { t, ph } from '@lingui/core/macro'

t`Hello ${ph({ name: user.name })}` // => 'Hello {name}'
```

An explicit label is a better choice than relying on the variable name. Developers expect that renaming a variable doesn't change how the code works, but when a placeholder is named after a variable, renaming `name` to `userName` turns `Hello {name}` into `Hello {userName}`. That is a new message for Lingui, and its existing translation is lost. A label given to `ph` is not affected by such refactoring.

The rule accepts:

- plain identifiers: `` t`Hello ${name}` `` (unless [`allowIdentifiers`](#allowidentifiers) is set to `false`)
- explicit labels: `` t`Hello ${ph({ name: user.name })}` `` or the shorthand `` t`Hello ${{ name: user.name }}` ``
- nested `plural`, `select`, and `selectOrdinal` macros

### Examples of **invalid** code with this rule:

```jsx
// invalid ⛔
t`Hello ${user.name}` // => 'Hello {0}'
t`Hello ${getUserName()}` // => 'Hello {0}'
msg`Hello ${user.name}` // => 'Hello {0}'
defineMessage`Hello ${user.name}` // => 'Hello {0}'
<Trans>Hello {user.name}</Trans> // => 'Hello {0}'

// an explicit label must contain exactly one key
t`Hello ${ph({ name: user.name, surname: user.surname })}`
```

### Examples of **valid** code with this rule:

```jsx
// valid ✅
t`Hello ${ph({ name: user.name })}` // => 'Hello {name}'
t`Hello ${ph({ name: getUserName() })}` // => 'Hello {name}'
msg`Hello ${ph({ name: user.name })}` // => 'Hello {name}'
defineMessage`Hello ${ph({ name: user.name })}` // => 'Hello {name}'
<Trans>Hello {ph({ name: user.name })}</Trans> // => 'Hello {name}'

// the object shorthand is equivalent to ph()
t`Hello ${{ name: user.name }}` // => 'Hello {name}'

// plain identifiers are named after the variable
const userName = user.name
t`Hello ${userName}` // => 'Hello {userName}'

// nested macros are allowed
t`You have ${plural(count, { one: '# message', other: '# messages' })}`
```

## Options

### `allowIdentifiers`

Type: `boolean`
Default: `true`

Whether a plain identifier such as `` t`Hello ${name}` `` is accepted as a placeholder. Set it to `false` to require an explicit label on every placeholder, so that renaming a variable can never change a message:

```jsx
// with allowIdentifiers: false

// invalid ⛔
t`Hello ${name}` // => 'Hello {name}', changes when the variable is renamed
<Trans>Hello {name}</Trans>

// valid ✅
t`Hello ${ph({ name })}` // => 'Hello {name}', regardless of the variable name
<Trans>Hello {ph({ name })}</Trans>
```

### Configuration example

```jsonc
// Report member expressions and function calls only (default behavior)
"lingui/no-expression-in-message": "error"

// Require an explicit label on every placeholder
"lingui/no-expression-in-message": ["error", { "allowIdentifiers": false }]
```
