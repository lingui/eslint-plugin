import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'

export const name = 'no-single-tag-to-translate'
export const rule = createRule({
  name,
  meta: {
    docs: {
      description: "doesn't allow <Trans></Trans> to wrap a single element unnecessarily.",
      recommended: 'error',
    },
    messages: {
      default: '<Trans></Trans> should not wrap a single element unnecessarily',
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
      'JSXElement[openingElement.name.name=Trans]'(node: TSESTree.JSXElement) {
        // delete all spaces or breaks
        const filteredChildren = node.children.filter((child: TSESTree.JSXChild) => {
          switch (child.type) {
            case TSESTree.AST_NODE_TYPES.JSXText:
              return child.value?.trim() !== ''
            default:
              return true
          }
        })

        if (
          filteredChildren.length === 1 &&
          filteredChildren[0].type !== TSESTree.AST_NODE_TYPES.JSXText
        ) {
          context.report({
            node,
            messageId: 'default',
          })
        }
      },
    }
  },
})
