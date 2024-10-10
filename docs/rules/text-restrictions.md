# text-restrictions

Check that strings/templates/jsxText doesn't contain patterns from the rules.

This rules enforces a consistency rules inside your messages.

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
- `isOnlyForTranslation` is a boolean indicating that patterns should be found only inside `Trans` tags or `t` tagged template
