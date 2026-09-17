import { parse } from '@typescript-eslint/parser'
import { collectLinguiDirectives, findDirectiveForLine, parseLinguiDirective } from './directives'

function getComments(code: string) {
  return parse(code, { comment: true, loc: true, range: true }).comments ?? []
}

describe('parseLinguiDirective', () => {
  it('should parse a single parameter', () => {
    expect(parseLinguiDirective('lingui-set comment="Checkout page"')).toEqual({
      reset: false,
      values: { comment: 'Checkout page' },
    })
  })

  it('should parse several parameters', () => {
    expect(
      parseLinguiDirective('lingui-set context="checkout" comment="Checkout page" idPrefix="co."'),
    ).toEqual({
      reset: false,
      values: { context: 'checkout', comment: 'Checkout page', idPrefix: 'co.' },
    })
  })

  it('should parse a reset without parameters', () => {
    expect(parseLinguiDirective('lingui-reset')).toEqual({ reset: true, values: {} })
  })

  it('should parse a reset with parameters', () => {
    expect(parseLinguiDirective('lingui-reset comment="Settings page"')).toEqual({
      reset: true,
      values: { comment: 'Settings page' },
    })
  })

  it('should mark an empty value as unset', () => {
    expect(parseLinguiDirective('lingui-set comment=""')).toEqual({
      reset: false,
      values: { comment: null },
    })
  })

  it('should ignore the whitespace surrounding a directive', () => {
    // Comment values keep the whitespace that separates them from the `//` or `/*` they follow.
    expect(parseLinguiDirective('  lingui-set comment="Checkout page"  ')).toEqual({
      reset: false,
      values: { comment: 'Checkout page' },
    })
  })

  it.each([
    ['a regular comment', 'eslint-disable-next-line'],
    ['a directive-like prefix', 'lingui-setup comment="Nope"'],
    ['a set without parameters', 'lingui-set'],
    ['an unknown parameter', 'lingui-set description="Nope"'],
    ['a parameter without a value', 'lingui-set comment'],
    ['an unquoted value', 'lingui-set comment=Nope'],
    ['trailing garbage', 'lingui-set comment="Checkout page" !'],
  ])('should not parse %s', (_name, value) => {
    expect(parseLinguiDirective(value)).toBeNull()
  })
})

describe('collectLinguiDirectives', () => {
  it('should return an empty list when a file has no directives', () => {
    expect(collectLinguiDirectives(getComments('// nothing to see here'))).toEqual([])
  })

  it('should collect line and block comments', () => {
    const directives = collectLinguiDirectives(
      getComments(`
        // lingui-set comment="From a line comment"
        /* lingui-set context="from-a-block-comment" */
      `),
    )

    expect(directives).toHaveLength(2)
    expect(directives[1].values).toEqual({
      comment: 'From a line comment',
      context: 'from-a-block-comment',
    })
  })

  it('should accumulate values across directives', () => {
    const directives = collectLinguiDirectives(
      getComments(`
        // lingui-set context="checkout" comment="Checkout page"
        // lingui-set comment="Updated note"
      `),
    )

    expect(directives.map((directive) => directive.values)).toEqual([
      { context: 'checkout', comment: 'Checkout page' },
      { context: 'checkout', comment: 'Updated note' },
    ])
  })

  it('should drop accumulated values on reset', () => {
    const directives = collectLinguiDirectives(
      getComments(`
        // lingui-set context="checkout" comment="Checkout page"
        // lingui-reset comment="Settings page"
        // lingui-reset
      `),
    )

    expect(directives.map((directive) => directive.values)).toEqual([
      { context: 'checkout', comment: 'Checkout page' },
      { comment: 'Settings page' },
      {},
    ])
    expect(directives.map((directive) => directive.reset)).toEqual([false, true, true])
  })

  it('should unset a single value with an empty parameter', () => {
    const directives = collectLinguiDirectives(
      getComments(`
        // lingui-set context="checkout" comment="Checkout page"
        // lingui-set comment=""
      `),
    )

    expect(directives[1].values).toEqual({ context: 'checkout' })
  })

  it('should keep track of the comment each directive was parsed from', () => {
    const [directive] = collectLinguiDirectives(
      getComments(`const message = 'Hello'
        // lingui-set comment="Checkout page"`),
    )

    expect(directive.line).toBe(2)
    expect(directive.comment.value).toBe(' lingui-set comment="Checkout page"')
  })
})

describe('findDirectiveForLine', () => {
  const directives = collectLinguiDirectives(
    getComments(`// lingui-set comment="First"
      const a = 1
      // lingui-set comment="Second"
      const b = 2
      // lingui-reset
      const c = 3`),
  )

  it('should return nothing when no directive precedes the line', () => {
    expect(findDirectiveForLine([], 10)).toBeUndefined()
  })

  it('should return the values of the directive declared on the same line', () => {
    expect(findDirectiveForLine(directives, 1)).toEqual({ comment: 'First' })
  })

  it('should return the values of the closest preceding directive', () => {
    expect(findDirectiveForLine(directives, 2)).toEqual({ comment: 'First' })
    expect(findDirectiveForLine(directives, 4)).toEqual({ comment: 'Second' })
  })

  it('should return no values after a reset', () => {
    expect(findDirectiveForLine(directives, 6)).toEqual({})
  })
})
