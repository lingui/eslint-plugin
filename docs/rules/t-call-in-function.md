# t-call-in-function

> [!TIP]
> This rule is included into the `lingui/recommended` config

Check that `t` calls are inside `function`. They should not be at the module level otherwise they will not react to language switching.

```jsx
import { t } from '@lingui/macro'

// nope ⛔️
const msg = t`Hello world!`

// ok ✅
function getGreeting() {
  return t`Hello world!`
}
```

Check the [Lingui Docs](https://lingui.dev/tutorials/react-patterns#translations-outside-react-components) for more info.
