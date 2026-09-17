import { parse } from '@typescript-eslint/parser'
import { TSESTree } from '@typescript-eslint/utils'
import {
  buildCalleePath,
  findJSXAttribute,
  findObjectProperty,
  getStaticStringValue,
  isRuntimeValue,
} from './helpers'

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

describe('getStaticStringValue', () => {
  function buildJSXAttributeValue(value: string) {
    const t = parse(`<Trans comment=${value}>Hello</Trans>`, { jsx: true })
    const element = (t.body[0] as TSESTree.ExpressionStatement).expression as TSESTree.JSXElement

    return (element.openingElement.attributes[0] as TSESTree.JSXAttribute).value
  }

  it('should resolve a string literal', () => {
    expect(getStaticStringValue(buildJSXAttributeValue('"Greeting"'))).toBe('Greeting')
  })

  it('should resolve a literal wrapped in an expression container', () => {
    expect(getStaticStringValue(buildJSXAttributeValue('{"Greeting"}'))).toBe('Greeting')
  })

  it('should resolve a template literal without expressions', () => {
    expect(getStaticStringValue(buildJSXAttributeValue('{`Greeting`}'))).toBe('Greeting')
  })

  it('should not resolve a template literal with expressions', () => {
    expect(getStaticStringValue(buildJSXAttributeValue('{`Greeting ${name}`}'))).toBeNull()
  })

  it('should not resolve a value that is only known at runtime', () => {
    expect(getStaticStringValue(buildJSXAttributeValue('{hint}'))).toBeNull()
  })

  it('should not resolve a non-string literal', () => {
    expect(getStaticStringValue(buildJSXAttributeValue('{42}'))).toBeNull()
  })

  it('should not resolve an empty expression container', () => {
    expect(getStaticStringValue(buildJSXAttributeValue('{/* nothing */}'))).toBeNull()
  })

  it('should not resolve a missing value', () => {
    expect(getStaticStringValue(null)).toBeNull()
  })
})

describe('isRuntimeValue', () => {
  function buildJSXAttributeValue(value: string) {
    const t = parse(`<Trans comment=${value}>Hello</Trans>`, { jsx: true })
    const element = (t.body[0] as TSESTree.ExpressionStatement).expression as TSESTree.JSXElement

    return (element.openingElement.attributes[0] as TSESTree.JSXAttribute).value
  }

  it('should return false for a string literal', () => {
    expect(isRuntimeValue(buildJSXAttributeValue('"Greeting"'))).toBe(false)
  })

  it('should return false for a literal wrapped in an expression container', () => {
    expect(isRuntimeValue(buildJSXAttributeValue('{"Greeting"}'))).toBe(false)
  })

  it('should return false for a non-string literal', () => {
    expect(isRuntimeValue(buildJSXAttributeValue('{true}'))).toBe(false)
    expect(isRuntimeValue(buildJSXAttributeValue('{42}'))).toBe(false)
    expect(isRuntimeValue(buildJSXAttributeValue('{null}'))).toBe(false)
  })

  it('should return false for undefined', () => {
    expect(isRuntimeValue(buildJSXAttributeValue('{undefined}'))).toBe(false)
  })

  it('should return false for a template literal without expressions', () => {
    expect(isRuntimeValue(buildJSXAttributeValue('{`Greeting`}'))).toBe(false)
  })

  it('should return false for an empty expression container', () => {
    expect(isRuntimeValue(buildJSXAttributeValue('{/* nothing */}'))).toBe(false)
  })

  it('should return false for a missing value', () => {
    expect(isRuntimeValue(null)).toBe(false)
  })

  it('should return true for a template literal with expressions', () => {
    expect(isRuntimeValue(buildJSXAttributeValue('{`Greeting ${name}`}'))).toBe(true)
  })

  it('should return true for a runtime identifier', () => {
    expect(isRuntimeValue(buildJSXAttributeValue('{hint}'))).toBe(true)
  })
})
