import { TSESTree } from '@typescript-eslint/utils'

import {
  getIdentifierName,
  getText,
  isJSXAttribute,
  isLiteral,
  isTemplateLiteral,
  LinguiCallExpressionMessageQuery,
  LinguiTaggedTemplateExpressionMessageQuery,
} from '../helpers'
import { createRule } from '../create-rule'

const ICU_MACROS = ['Plural', 'Select', 'SelectOrdinal']

export const name = 'no-single-variables-to-translate'
export const rule = createRule({
  name,
  meta: {
    docs: {
      description: "doesn't allow single variables without text to translate",
      recommended: 'error',
    },
    messages: {
      asJsx: "You couldn't translate just a variable, remove Trans or add some text inside",
      asFunction: "You couldn't translate just a variable, remove t`` or add some text inside",
    },
    schema: [
      {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    ],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context) {
    const hasIcuAttributeText = (value: TSESTree.JSXAttribute['value']): boolean => {
      if (!value) {
        return false
      }

      const node =
        value.type === TSESTree.AST_NODE_TYPES.JSXExpressionContainer ? value.expression : value

      if (isLiteral(node)) {
        return typeof node.value === 'string' && node.value.trim().length > 0
      }

      if (isTemplateLiteral(node)) {
        return getText(node).trim().length > 0
      }

      if (
        node.type === TSESTree.AST_NODE_TYPES.JSXElement ||
        node.type === TSESTree.AST_NODE_TYPES.JSXFragment
      ) {
        return hasSomeJSXTextWithContent([node])
      }

      return false
    }

    /**
     * The text of a Lingui ICU macro lives in its choice props, not in JSX children:
     * <Plural value={count} one="item" other="items" /> produces
     * `{count, plural, one {item} other {items}}`.
     */
    const hasIcuTextWithContent = (element: TSESTree.JSXElement): boolean => {
      return element.openingElement.attributes.some(
        (attr) =>
          isJSXAttribute(attr) &&
          attr.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier &&
          /^(zero|one|two|few|many|other|_\w+)$/.test(attr.name.name) &&
          hasIcuAttributeText(attr.value),
      )
    }

    const hasSomeJSXTextWithContent = (nodes: TSESTree.JSXChild[]): boolean => {
      return nodes.some((jsxChild) => {
        switch (jsxChild.type) {
          case TSESTree.AST_NODE_TYPES.JSXText:
            return jsxChild.value.trim().length > 0
          case TSESTree.AST_NODE_TYPES.JSXElement:
            return ICU_MACROS.includes(getIdentifierName(jsxChild.openingElement.name) ?? '')
              ? hasIcuTextWithContent(jsxChild)
              : hasSomeJSXTextWithContent(jsxChild.children)
          case TSESTree.AST_NODE_TYPES.JSXFragment:
            return hasSomeJSXTextWithContent(jsxChild.children)
          case TSESTree.AST_NODE_TYPES.JSXExpressionContainer:
            return hasIcuAttributeText(jsxChild)
          default:
            return false
        }
      })
    }
    return {
      'JSXElement[openingElement.name.name=Trans]'(node: TSESTree.JSXElement) {
        const hasIdProperty =
          node.openingElement.attributes.find(
            (attr) => isJSXAttribute(attr) && attr.name.name === 'id',
          ) !== undefined

        if (!hasSomeJSXTextWithContent(node.children) && !hasIdProperty) {
          context.report({
            node,
            messageId: 'asJsx',
          })
        }
      },
      [`${LinguiTaggedTemplateExpressionMessageQuery}, ${LinguiCallExpressionMessageQuery}`](
        node: TSESTree.TemplateLiteral | TSESTree.Literal,
      ) {
        if (getText(node)) {
          return
        }

        if (
          node.type === TSESTree.AST_NODE_TYPES.TemplateLiteral &&
          node.expressions.length === 1 &&
          node.expressions[0].type === TSESTree.AST_NODE_TYPES.CallExpression &&
          node.expressions[0].callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
          ['plural', 'select', 'selectOrdinal'].includes(node.expressions[0].callee.name)
        ) {
          return
        }

        context.report({
          node,
          messageId: 'asFunction',
        })
      },
    }
  },
})
