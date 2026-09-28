# no-expression-in-message

Ensure that every placeholder in a message has a meaningful name. Reports member expressions, function calls, and other complex expressions inside `` t` ` ``, `msg`, `defineMessage`, and `<Trans>`, such as `` t`Hello ${user.name}` `` or `<Trans>Hello {getName()}</Trans>`.

Lingui names a placeholder after the variable it interpolates, so `` t`Hello ${name}` `` is extracted as `Hello {name}`. Any other expression is extracted by its index, as `Hello {0}`, which gives translators and AI translation tools no information about what the value is.

## Rule Details

Wrap the expression in the [`ph`](https://lingui.dev/ref/macro#ph) macro to give the placeholder an explicit name. The key of the object becomes the placeholder name and the value is the expression:

```jsx
import { t, ph } from '@lingui/core/macro'

t`Hello ${ph({ name: user.name })}` // => 'Hello {name}'
```

Explicit names are preferred over relying on the variable name, because a placeholder named after a variable changes whenever the variable is renamed, and with it the message ID. The label given to `ph` stays stable through refactoring.

The rule accepts:

- plain identifiers: `` t`Hello ${name}` ``
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
