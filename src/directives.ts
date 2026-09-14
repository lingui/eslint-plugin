import { TSESTree } from '@typescript-eslint/utils'

/**
 * Values a Lingui context directive can declare.
 *
 * @see https://lingui.dev/ref/macro#lingui-directive
 */
export type DirectiveValues = {
  context?: string
  comment?: string
  idPrefix?: string
}

/**
 * Values declared by a single directive, before they are merged with the ones already in
 * effect. `null` means the value is explicitly unset, which is what `key=""` does.
 */
export type DeclaredValues = { [Key in keyof DirectiveValues]: string | null }

/** A directive as it was written, before its values are merged with the ones in effect. */
export type ParsedDirective = {
  reset: boolean
  values: DeclaredValues
}

/** A `lingui-set` or `lingui-reset` directive, with the values it puts in effect. */
export type LinguiDirective = {
  /** Comment the directive was parsed from. */
  comment: TSESTree.Comment
  /** Line the directive is declared on. Its values apply from this line onwards. */
  line: number
  /** Whether the directive is a `lingui-reset`, which drops the values already in effect. */
  reset: boolean
  /** Values in effect from this directive onwards, accumulated from the preceding ones. */
  values: DirectiveValues
}

const DIRECTIVE_PARAMS = new Set<string>(['context', 'comment', 'idPrefix'])

/**
 * Matches the directive name and, in the trailing group, its raw parameter list.
 *
 * `.` doesn't match line terminators, so only the first line of a block comment can declare
 * parameters. This mirrors the macro implementation.
 */
const DIRECTIVE_RE = /^(lingui-set|lingui-reset)(?:\s|$)(.*)/

/** Matches a single `key="value"` parameter, or the whitespace separating two of them. */
const PARAM_RE = /\s+|(\w+)(?:="([^"]*)")?/g

/**
 * Parses the text of a comment into a Lingui directive.
 *
 * Mirrors the grammar of `@lingui/babel-plugin-lingui-macro`, with one deliberate difference:
 * a malformed directive resolves to `null` instead of raising. Reporting invalid syntax is the
 * job of the macro, which has the whole file at hand, while a lint rule should stay silent
 * about the code it can't make sense of.
 *
 * @returns `null` when the comment isn't a well-formed Lingui directive.
 */
export function parseLinguiDirective(commentValue: string): ParsedDirective | null {
  const directive = DIRECTIVE_RE.exec(commentValue.trim())
  if (!directive) return null

  const reset = directive[1] === 'lingui-reset'
  const params = directive[2].trim()
  const values: DeclaredValues = {}
  let declared = false
  let consumed = 0
  let param: RegExpExecArray | null

  PARAM_RE.lastIndex = 0
  while ((param = PARAM_RE.exec(params)) != null) {
    // Anything the parameter grammar can't consume makes the whole directive invalid.
    if (param.index !== consumed) return null
    consumed = param.index + param[0].length

    const [, key, value] = param
    // Whitespace between two parameters.
    if (!key) continue
    if (!DIRECTIVE_PARAMS.has(key) || value == null) return null

    declared = true
    values[key as keyof DirectiveValues] = value === '' ? null : value
  }

  if (consumed !== params.length) return null
  // `lingui-reset` is meaningful on its own, `lingui-set` isn't.
  if (!declared && !reset) return null

  return { reset, values }
}

/** Drops the values a directive explicitly unset with `key=""`. */
function withoutUnsetValues(values: DeclaredValues): DirectiveValues {
  const result: DirectiveValues = {}
  for (const [key, value] of Object.entries(values)) {
    if (value != null) result[key as keyof DirectiveValues] = value
  }
  return result
}

/**
 * Collects the Lingui directives of a file, in source order, resolving the values each one
 * puts in effect: `lingui-set` merges its values into the ones already in effect, while
 * `lingui-reset` drops them and starts over with its own.
 */
export function collectLinguiDirectives(comments: readonly TSESTree.Comment[]): LinguiDirective[] {
  const parsed = comments
    .flatMap((comment) => {
      const directive = parseLinguiDirective(comment.value)
      return directive ? [{ comment, directive }] : []
    })
    // Comments are already in source order, sorting only guards against unordered input.
    .sort((a, b) => a.comment.loc.start.line - b.comment.loc.start.line)

  let inEffect: DirectiveValues = {}

  return parsed.map(({ comment, directive: { reset, values } }) => {
    inEffect = withoutUnsetValues(reset ? values : { ...inEffect, ...values })

    return { comment, line: comment.loc.start.line, reset, values: inEffect }
  })
}

/**
 * Returns the directive values in effect on the given line.
 *
 * A directive applies from the line it is declared on, which includes macros written on that
 * very same line.
 *
 * @returns `undefined` when no directive precedes the line.
 */
export function findDirectiveForLine(
  directives: readonly LinguiDirective[],
  line: number,
): DirectiveValues | undefined {
  // The last directive declared on or before `line` is the one in effect.
  for (let index = directives.length - 1; index >= 0; index--) {
    if (directives[index].line <= line) return directives[index].values
  }

  return undefined
}
