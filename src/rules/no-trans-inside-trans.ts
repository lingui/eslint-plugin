import { TSESTree } from '@typescript-eslint/utils'
import { hasAncestorWithName, getIdentifierName } from '../helpers'
import { createRule } from '../create-rule'

export const name = 'no-trans-inside-trans'
export const rule = createRule({
  name,
  meta: {
    docs: {
      description: "doesn't allow Trans component be inside Trans component",
      recommended: 'error',
    },
    messages: {
      default: "Trans couldn't be wrapped into Trans",
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
      JSXElement(node: TSESTree.JSXElement) {
        const identifierName = getIdentifierName(node?.openingElement?.name)
        if (identifierName === 'Trans' && hasAncestorWithName(node, 'Trans')) {
          context.report({
            node,
            messageId: 'default',
          })
        }

        return
      },
    }
  },
})
