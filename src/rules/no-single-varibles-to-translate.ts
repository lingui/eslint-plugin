import { TSESTree } from '@typescript-eslint/utils'
import { RuleContext, RuleRecommendation } from '@typescript-eslint/utils/dist/ts-eslint/Rule'
import {
  getQuasisValue,
  getNearestAncestor,
  getIdentifierName,
  isTTaggedTemplateExpression,
} from '../helpers'

export default {
  meta: {
    docs: {
      description: "doesn't allow single variables without text to translate",
      category: 'Best Practices',
      recommended: 'error' as RuleRecommendation,
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

  create: function (context: RuleContext<string, readonly unknown[]>) {
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

          if (!isSomeJSXTextWithContent) {
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
}
