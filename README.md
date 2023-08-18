# <div align="center">A ESLint Plugin For LinguiJS</div>

<div align="center">

Set of eslint rules for [LinguiJS](https://lingui.dev) projects <img src="https://img.shields.io/badge/beta-yellow"/>

[//]: # 'add badges here'

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

## Usage

Add `lingui` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["lingui"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "lingui/missing-lingui-transformation": 2,
    "lingui/t-call-in-function": 2,
    "lingui/no-single-variables-to-translate": 2,
    "lingui/i18n-only-identifiers": 2,
    "lingui/no-single-tag-to-translate": 2,
    "lingui/no-trans-inside-trans": 2,
    "lingui/text-restrictions": [
      2,
      {
        "rules": [
          {
            "patterns": ["''", "’", "“"],
            "message": "Error message"
          }
        ]
      }
    ]
  }
}
```

## Supported Rules

## missing-lingui-transformation

Check that code doesn't contain strings/templates/jsxText what should be wrapped into `<Trans>` or `i18n`

### Options

#### ignore

The `ignore` option specifies exceptions not to check for
literal strings that match one of regexp patterns.

Examples of correct code for the `{ "ignore": ["rgba"] }` option:

```jsx
/*eslint lingui/missing-lingui-transformation ["error", {"ignore": ["rgba"]}]*/
const a = <div color="rgba(100, 100, 100, 0.4)"></div>
```

#### ignoreFunction

The `ignoreFunction` option specifies exceptions not check for
function calls whose names match one of regexp patterns.

Examples of correct code for the `{ "ignoreFunction": ["showIntercomMessage"] }` option:

```js
/*eslint lingui/missing-lingui-transformation: ["error", { "ignoreFunction": ["showIntercomMessage"] }]*/
const bar = showIntercomMessage('Please, write me')
```

#### ignoreAttribute

The `ignoreAttribute` option specifies exceptions not to check for JSX attributes that match one of ignored attributes.

Examples of correct code for the `{ "ignoreAttribute": ["style"] }` option:

```jsx
/*eslint lingui/missing-lingui-transformation: ["error", { "ignoreAttribute": ["style"] }]*/
const element = <div style={{ margin: '1rem 2rem' }} />
```

## t-call-in-function

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

## i18n-only-identifiers

Check that `` t` ` `` doesn't contain member or function expressions like `` t`Hello ${user.name}` `` or `` t`Hello ${getName()}` ``

Such expressions would be transformed to its index position such as `Hello {0}` which gives zero to little context for translator.

Use a variable identifier instead.

```jsx
// nope ⛔️
t`Hello ${user.name}` // => 'Hello {0}'

// ok ✅
const userName = user.name
t`Hello ${userName}` // => 'Hello {userName}'
```

## no-trans-inside-trans

Check that no `Trans` inside `Trans` components.

```jsx
// nope ⛔️
<Trans>Hello <Trans>World!</Trans></Trans>

// ok ✅
<Trans>Hello World!</Trans>
```

## no-single-variables-to-translate

Doesn't allow single variables without text to translate like `<Trans>{variable}</Trans>` or `` t`${variable}` ``

Such expression would pollute message catalog with useless string which has nothing to translate.

## text-restrictions

Check that strings/templates/jsxText doesn't contain patterns from the rules.

This rules enforces a consistency rules inside your messages.

### Options

### rules

`rules` is array of rules when one rule has structure

```json
{
  "patterns": ["first", "second"],
  "message": "error message"
}
```

each `rule` has a structure:

- `patterns` is an array of regex or strings
- `message` is an error message that will be displayed if restricting pattern matches text
- `flags` is a string with regex flags for patterns
- `isOnlyForTranslation` is a boolean indicating that patterns should be found only inside `Trans` tags or `t` tagged template

## no-single-tag-to-translate

Ensures `<Trans></Trans>` isn't wrapping a single element unnecessarily

```jsx
// nope ⛔️
<Trans><strong>Foo bar</strong></Trans>

// ok ✅
<strong><Trans>Foo bar</Trans></strong>
```
