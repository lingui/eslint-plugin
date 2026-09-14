# require-directive-reset

Enforce that [Lingui context directives](https://lingui.dev/ref/macro#lingui-directive) are closed with a `// lingui-reset` comment.

A `lingui-set` directive applies to every macro that follows it in the file, until it is overridden or reset. That is convenient for a block of related messages, but a directive that is never closed silently attaches its `context`, `comment` and `idPrefix` to unrelated messages added later, which is easy to miss in review and changes the IDs that are extracted.

Closing a directive keeps its scope visible where the block ends, rather than implicitly at the end of the file.

```js
// nope ⛔️
// lingui-set context="checkout" comment="Checkout page strings"
const title = t`Order summary`
const cta = t`Complete purchase`

// ok ✅
// lingui-set context="checkout" comment="Checkout page strings"
const title = t`Order summary`
const cta = t`Complete purchase`
// lingui-reset
```

## Rule Details

Directives accumulate, and a single `lingui-reset` drops everything in effect, so a block doesn't need one reset per `lingui-set`:

```js
// ok ✅
// lingui-set context="checkout"
// lingui-set comment="Checkout page strings"
const title = t`Order summary`
// lingui-reset
```

A `lingui-reset` that declares values closes the previous scope and opens its own, which in turn has to be closed:

```js
// nope ⛔️ (the settings scope is never closed)
// lingui-set comment="Checkout page strings"
const title = t`Order summary`
// lingui-reset comment="Settings page strings"
const preferences = t`Preferences`

// ok ✅
// lingui-set comment="Checkout page strings"
const title = t`Order summary`
// lingui-reset comment="Settings page strings"
const preferences = t`Preferences`
// lingui-reset
```

A `lingui-reset` with nothing to reset is reported as well, since it suggests a directive was moved or removed but its reset was left behind:

```js
// nope ⛔️
// lingui-set comment="Checkout page strings"
const title = t`Order summary`
// lingui-reset
// lingui-reset
```

Comments that don't follow the directive syntax are left to the macro to report, and are ignored by this rule.

## Related rules

- [`require-comment`](./require-comment.md) accepts a `lingui-set comment="..."` directive as the description of the messages that follow it.
