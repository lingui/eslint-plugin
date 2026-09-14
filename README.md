# <div align="center">An ESLint Plugin For Lingui<sub>js</sub></div>

<div align="center">

Set of eslint rules for [Lingui](https://lingui.dev) projects <img src="https://img.shields.io/badge/beta-yellow"/>

[![npm](https://img.shields.io/npm/v/eslint-plugin-lingui?logo=npm&cacheSeconds=1800)](https://www.npmjs.com/package/eslint-plugin-lingui)
[![npm](https://img.shields.io/npm/dt/eslint-plugin-lingui?cacheSeconds=500)](https://www.npmjs.com/package/eslint-plugin-lingui)
[![main-suite](https://github.com/lingui/eslint-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/lingui/eslint-plugin/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/lingui/eslint-plugin/graph/badge.svg?token=ULkNOaWVaw)](https://codecov.io/gh/lingui/eslint-plugin)
[![GitHub](https://img.shields.io/github/license/lingui/eslint-plugin)](https://github.com/lingui/eslint-plugin/blob/main/LICENSE)

</div>

## Installation

You'll first need to install [ESLint](http://eslint.org):

```bash
npm install --save-dev eslint
# or
yarn add eslint --dev
```

Next, install `eslint-plugin-lingui`:

```bash
npm install --save-dev eslint-plugin-lingui
# or
yarn add eslint-plugin-lingui --dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-lingui` globally.

## Flat Config (`eslint.config.js`)

### Recommended Setup

To enable all the recommended rules for our plugin, add the following config:

```js
import pluginLingui from 'eslint-plugin-lingui'

export default [
  pluginLingui.configs['flat/recommended'],
  // Any other config...
]
```

We also recommend enabling the [no-unlocalized-strings](docs/rules/no-unlocalized-strings.md) rule. It’s not enabled by default because it needs to be set up specifically for your project. Please check the rule's documentation for example configurations.

### Custom setup

Alternatively, you can load the plugin and configure only the rules you want to use:

```js
import pluginLingui from 'eslint-plugin-lingui'

export default [
  {
    plugins: {
      lingui: pluginLingui,
    },
    rules: {
      'lingui/t-call-in-function': 'error',
    },
  },
  // Any other config...
]
```

## Legacy Config (`.eslintrc`)

### Recommended setup

To enable all of the recommended rules for our plugin, add `plugin:lingui/recommended` in extends:

```json
{
  "extends": ["plugin:lingui/recommended"]
}
```

### Custom setup

Alternatively, add `lingui` to the plugins section, and configure the rules you want to use:

```json
{
  "plugins": ["lingui"],
  "rules": {
    "lingui/t-call-in-function": "error"
  }
}
```

## Oxlint

The plugin also works as an [Oxlint JS plugin](https://oxc.rs/docs/guide/usage/linter/js-plugins) without any changes. Add it to `jsPlugins` in your `.oxlintrc.json` and enable the rules you need. Oxlint doesn't read the plugin's `configs`, so the recommended rules have to be listed explicitly:

```json
{
  "jsPlugins": ["eslint-plugin-lingui"],
  "rules": {
    "lingui/t-call-in-function": "error",
    "lingui/no-single-tag-to-translate": "warn",
    "lingui/no-single-variables-to-translate": "warn",
    "lingui/no-trans-inside-trans": "warn",
    "lingui/no-expression-in-message": "warn"
  }
}
```

Compatibility is verified in CI on every change. The only known limitation is the `useTsTypes` option of [no-unlocalized-strings](docs/rules/no-unlocalized-strings.md): it needs type information from `@typescript-eslint/parser`, which Oxlint doesn't provide.

## Rules

✅ - Recommended

- ✅ [no-expression-in-message](docs/rules/no-expression-in-message.md)
- ✅ [no-single-tag-to-translate](docs/rules/no-single-tag-to-translate.md)
- ✅ [no-single-variables-to-translate](docs/rules/no-single-variables-to-translate.md)
- ✅ [no-trans-inside-trans](docs/rules/no-trans-inside-trans.md)
- ✅ [t-call-in-function](docs/rules/t-call-in-function.md)
- [no-unnamed-tag-placeholders](docs/rules/no-unnamed-tag-placeholders.md)
- [no-unlocalized-strings](docs/rules/no-unlocalized-strings.md)
- [text-restrictions](docs/rules/text-restrictions.md)
- [consistent-plural-format](docs/rules/consistent-plural-format.md)
- [no-plural-inside-trans](docs/rules/no-plural-inside-trans.md)
- [require-explicit-id](docs/rules/require-explicit-id.md)
- [require-implicit-id](docs/rules/require-implicit-id.md)
