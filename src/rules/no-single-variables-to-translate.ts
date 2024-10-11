import { TSESTree } from '@typescript-eslint/utils'

import {
  getQuasisValue,
  getNearestAncestor,
  getIdentifierName,
  isTTaggedTemplateExpression,
} from '../helpers'
import { createRule } from '../create-rule'

export const name = 'no-single-variable-to-translate'
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
    const hasSomeJSXTextWithContent = (nodes: TSESTree.JSXChild[]): boolean => {
      return nodes.some((jsxChild) => {
        switch (jsxChild.type) {
          case TSESTree.AST_NODE_TYPES.JSXText:
            return jsxChild.value.trim().length > 0
          case TSESTree.AST_NODE_TYPES.JSXElement:
          case TSESTree.AST_NODE_TYPES.JSXFragment:
            return hasSomeJSXTextWithContent(jsxChild.children)
          default:
            return false
        }
      })
    }
    return {
      JSXElement(node: TSESTree.JSXElement) {
        const identifierName = getIdentifierName(node?.openingElement?.name)
        if (identifierName === 'Trans') {
          const isSomeJSXTextWithContent = node && hasSomeJSXTextWithContent(node.children)
          const hasIdProperty =
            node.openingElement.attributes.find(
              (attr) => attr.type === 'JSXAttribute' && attr.name.name === 'id',
            ) !== undefined

          if (!isSomeJSXTextWithContent && !hasIdProperty) {
            context.report({
              node,
              messageId: 'asJsx',
            })
          }
        }
        return
      },
      'TemplateLiteral:exit'(node: TSESTree.TemplateLiteral) {
        const taggedTemplate = getNearestAncestor<TSESTree.TaggedTemplateExpression>(
          node,
          'TaggedTemplateExpression',
        )
        const quasisValue = getQuasisValue(node)
        if (
          taggedTemplate &&
          isTTaggedTemplateExpression(taggedTemplate) &&
          (!quasisValue || !quasisValue.length)
        ) {
          context.report({
            node,
            messageId: 'asFunction',
          })
        }

        return
      },
    }
  },
})
