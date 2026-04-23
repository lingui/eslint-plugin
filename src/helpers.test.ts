import { parse } from '@typescript-eslint/parser'
import { TSESTree } from '@typescript-eslint/utils'
import { buildCalleePath, findJSXAttribute, findObjectProperty } from './helpers'

describe('findJSXAttribute', () => {
  function buildJSXElement(code: string) {
    const t = parse(code, { jsx: true })
    return (t.body[0] as TSESTree.ExpressionStatement).expression as TSESTree.JSXElement
  }

  it('should find an attribute by name', () => {
    const node = buildJSXElement('<Trans id="msg.hello">Hello</Trans>')
    const attr = findJSXAttribute(node, 'id')

    expect(attr).toBeDefined()
    expect(attr!.name.name).toBe('id')
  })

  it('should return undefined when attribute is missing', () => {
    const node = buildJSXElement('<Trans>Hello</Trans>')
    const attr = findJSXAttribute(node, 'id')

    expect(attr).toBeUndefined()
  })

  it('should find the correct attribute among several', () => {
    const node = buildJSXElement('<Trans id="msg.hello" context="greeting">Hello</Trans>')

    expect(findJSXAttribute(node, 'id')).toBeDefined()
    expect(findJSXAttribute(node, 'context')).toBeDefined()
    expect(findJSXAttribute(node, 'missing')).toBeUndefined()
  })

  it('should ignore JSX spread attributes', () => {
    const node = buildJSXElement('<Trans {...props}>Hello</Trans>')

    expect(findJSXAttribute(node, 'id')).toBeUndefined()
  })
})

describe('findObjectProperty', () => {
  function buildObjectExpression(code: string) {
    const t = parse(code)
    return (t.body[0] as TSESTree.ExpressionStatement).expression as TSESTree.ObjectExpression
  }

  it('should find a property with an identifier key', () => {
    const obj = buildObjectExpression('({ id: "msg.hello", message: "Hello" })')
    const prop = findObjectProperty(obj, 'id')

    expect(prop).toBeDefined()
    expect((prop!.key as TSESTree.Identifier).name).toBe('id')
  })

  it('should find a property with a string literal key', () => {
    const obj = buildObjectExpression("({ 'id': 'msg.hello', message: 'Hello' })")
    const prop = findObjectProperty(obj, 'id')

    expect(prop).toBeDefined()
    expect((prop!.key as TSESTree.Literal).value).toBe('id')
  })

  it('should return undefined when property is missing', () => {
    const obj = buildObjectExpression('({ message: "Hello" })')
    const prop = findObjectProperty(obj, 'id')

    expect(prop).toBeUndefined()
  })

  it('should find the correct property among several', () => {
    const obj = buildObjectExpression(
      '({ id: "msg.hello", message: "Hello", context: "greeting" })',
    )

    expect(findObjectProperty(obj, 'id')).toBeDefined()
    expect(findObjectProperty(obj, 'message')).toBeDefined()
    expect(findObjectProperty(obj, 'context')).toBeDefined()
    expect(findObjectProperty(obj, 'missing')).toBeUndefined()
  })

  it('should ignore spread elements', () => {
    const obj = buildObjectExpression('({ ...defaults, message: "Hello" })')

    expect(findObjectProperty(obj, 'id')).toBeUndefined()
    expect(findObjectProperty(obj, 'message')).toBeDefined()
  })
})

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
