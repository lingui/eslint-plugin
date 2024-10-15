# text-restrictions

Check that translated messages doesn't contain patterns from the rules.

This rule enforces a consistency rules inside your messages.

## rules

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

## Example

Restrict specific quotes to be used in the messages:

```json
{
  "lingui/text-restrictions": [
    "error",
    {
      "rules": [
        {
          "patterns": ["''", "’", "“"],
          "message": "Quotes should be ' or \""
        }
      ]
    }
  ]
}
```

Example of invalid code with this rule:

```js
t`Hello “mate“`
msg`Hello “mate“`
t({ message: `Hello “mate“` })
```

Example of valid code with this rule:

```js
t`Hello "mate"`
```
