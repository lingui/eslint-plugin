import { TSESTree } from '@typescript-eslint/utils'

import { DOM_TAGS, SVG_TAGS } from './constants'

export function isUpperCase(str: string) {
  return /^[A-Z_-]+$/.test(str)
}

export function isNativeDOMTag(str: string) {
  return DOM_TAGS.includes(str)
}

export function isSvgTag(str: string) {
  return SVG_TAGS.includes(str)
}

export function containAllAttributes(attributeNames: string[]) {
  const attrs = ['value', 'other']
  return attrs.every((attr) => attributeNames.includes(attr))
}

export function isLinguiTags(str: string, attributeNames: string[]) {
  if (str === 'Trans') {
    return true
  }
  return ['Plural', 'Select'].includes(str) && containAllAttributes(attributeNames)
}

const blacklistAttrs = ['placeholder', 'alt', 'aria-label', 'value']
export function isAllowedDOMAttr(tag: string, attr: string, attributeNames: string[]) {
  if (isSvgTag(tag)) return true
  if (isNativeDOMTag(tag)) {
    return !blacklistAttrs.includes(attr)
  }
  if (isLinguiTags(tag, attributeNames)) {
    return true
  }
  return false
}

export function getNearestAncestor<Type>(node: any, type: string): Type | null {
  let temp = node.parent
  while (temp) {
    if (temp.type === type) {
      return temp as Type
    }
    temp = temp.parent
  }
  return null
}

export const isTTaggedTemplateExpression = (node: TSESTree.TaggedTemplateExpression | null) => {
  return (
    node?.type === TSESTree.AST_NODE_TYPES.TaggedTemplateExpression &&
    node.tag.type === TSESTree.AST_NODE_TYPES.Identifier &&
    node.tag.name === 't'
  )
}

export const isLinguiTaggedTemplateExpression = (
  node: TSESTree.TaggedTemplateExpression | null,
) => {
  return (
    node?.type === TSESTree.AST_NODE_TYPES.TaggedTemplateExpression &&
    node.tag.type === TSESTree.AST_NODE_TYPES.Identifier &&
    [`t`, `msg`, `defineMessage`].includes(node.tag.name)
  )
}

export const getQuasisValue = (node: TSESTree.TemplateLiteral, trim: boolean = true) => {
  if (node.quasis) {
    const quasisCookedArray = node.quasis.map(
      (quasis: TSESTree.TemplateElement) => quasis.value.cooked,
    )
    const cookedArrayString = quasisCookedArray.join('')
    if (trim) {
      return cookedArrayString.trim()
    }

    return cookedArrayString
  }
  return ''
}

export function hasAncestorWithName(
  node: TSESTree.JSXElement | TSESTree.TemplateLiteral | TSESTree.Literal | TSESTree.JSXText,
  name: string,
) {
  let p: TSESTree.Node = node.parent
  while (p) {
    switch (p.type) {
      case TSESTree.AST_NODE_TYPES.JSXElement:
        const identifierName = getIdentifierName(p?.openingElement?.name)
        if (identifierName === name) {
          return true
        }
      default:
    }

    p = p.parent
  }
  return false
}

export function isNodeTranslated(
  node: TSESTree.TemplateLiteral | TSESTree.Literal | TSESTree.JSXText,
) {
  if (hasAncestorWithName(node, 'Trans')) {
    return true
  }
  const taggedTemplate = getNearestAncestor<TSESTree.TaggedTemplateExpression>(
    node,
    TSESTree.AST_NODE_TYPES.TaggedTemplateExpression,
  )

  return taggedTemplate ? isLinguiTaggedTemplateExpression(taggedTemplate) : false
}

export function getIdentifierName(jsxTagNameExpression: TSESTree.JSXTagNameExpression) {
  switch (jsxTagNameExpression.type) {
    case TSESTree.AST_NODE_TYPES.JSXIdentifier:
      return jsxTagNameExpression.name
    default:
      return null
  }
}
