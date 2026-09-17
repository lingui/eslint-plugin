// @ts-nocheck
// Every rule of the plugin must report at least once in this file.
// `tests/oxlint/run.js` fails if a rule is missing here, so extend it when adding a rule.
import { t, Trans, Plural, plural } from '@lingui/macro'

// t-call-in-function
const topLevel = t`Top level call`

export function Component({ name, count }) {
  // no-single-variables-to-translate
  const single = <Trans>{name}</Trans>
  // no-single-tag-to-translate
  const tag = (
    <Trans>
      <strong>Only a tag</strong>
    </Trans>
  )
  // no-trans-inside-trans
  const nested = (
    <Trans>
      Outer <Trans>Inner</Trans>
    </Trans>
  )
  // no-expression-in-message
  const expression = <Trans>Hello {name.toUpperCase()}</Trans>
  // no-plural-inside-trans
  const pluralInTrans = (
    <Trans>
      <Plural value={count} one="# item" other="# items" />
    </Trans>
  )
  // consistent-plural-format (default style is "hash")
  const inconsistent = plural(count, { one: `${count} book`, other: `${count} books` })
  // no-unnamed-tag-placeholders
  const unnamed = (
    <Trans>
      Click <a href="/docs">here</a>
    </Trans>
  )
  // require-explicit-id, require-comment
  const noId = <Trans>Hello</Trans>
  // require-implicit-id
  const withId = <Trans id="msg.hello">Hello</Trans>
  // text-restrictions
  const quotes = t`Hello “mate“`
  // no-unlocalized-strings
  const raw = 'Hardcoded user facing text'

  return <div>{raw}</div>
}

// require-directive-reset (a directive that is never closed)
// lingui-set context="fixtures"
