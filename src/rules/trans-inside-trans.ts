import { TSESTree } from '@typescript-eslint/utils'
import { RuleContext } from '@typescript-eslint/utils/dist/ts-eslint/Rule'
import { hasAncestorWithName, getIdentifierName } from '../helpers'

module.exports = {
  meta: {
    docs: {
      description: "doesn't allow Trans component be inside Trans component",
      category: 'Best Practices',
      recommended: true,
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
  },

  create: function (context: RuleContext<string, readonly unknown[]>) {
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
}
