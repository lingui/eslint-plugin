import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import { LinguiTransQuery } from '../helpers'

export const name = 'require-trans-id'
export const rule = createRule({
  name,
  meta: {
    docs: {
      description: "enforce 'id' attribute on Trans components",
      recommended: 'error',
    },
    messages: {
      default: "Trans component requires an explicit 'id' attribute",
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
    return {
      [LinguiTransQuery](node: TSESTree.JSXElement) {
        const hasId = node.openingElement.attributes.some(
          (attr) =>
            attr.type === TSESTree.AST_NODE_TYPES.JSXAttribute &&
            attr.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier &&
            attr.name.name === 'id',
        )

        if (!hasId) {
          context.report({
            node,
            messageId: 'default',
          })
        }
      },
    }
  },
})
