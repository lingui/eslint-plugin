import { parse } from '@typescript-eslint/parser'
import { TSESTree } from '@typescript-eslint/utils'
import { buildCalleePath } from './helpers'

describe('buildCalleePath', () => {
  function buildCallExp(code: string) {
    const t = parse(code)

    return (t.body[0] as TSESTree.ExpressionStatement).expression as TSESTree.CallExpression
  }

  it('Should build callee path', () => {
    const exp = buildCallExp('one.two.three.four()')

    expect(buildCalleePath(exp.callee)).toBe('one.two.three.four')
  })

  it('Should build with dynamic element', () => {
    const exp = buildCallExp('one.two.three[getProp()]()')

    expect(buildCalleePath(exp.callee)).toBe('one.two.three.$')
  })

  it('Should build with dynamic first element', () => {
    const exp = buildCallExp('getData().two.three.four()')

    expect(buildCalleePath(exp.callee)).toBe('$.two.three.four')
  })
})
