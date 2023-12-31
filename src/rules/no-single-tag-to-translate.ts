import {
  RuleContext,
  RuleRecommendation,
  RuleModule,
} from '@typescript-eslint/utils/dist/ts-eslint/Rule'
import { TSESTree } from '@typescript-eslint/utils'

const rule: RuleModule<string, readonly unknown[]> = {
  meta: {
    docs: {
      description: "doesn't allow <Trans></Trans> to wrap a single element unnecessarily.",
      recommended: 'error' as RuleRecommendation,
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

  create: function (context: RuleContext<string, readonly unknown[]>) {
    return {
      'JSXClosingElement > JSXIdentifier[name=Trans]'(node: TSESTree.JSXIdentifier) {
        const parentJSXElement: TSESTree.JSXElement = node.parent?.parent as TSESTree.JSXElement

        // delete all spaces or breaks
        const filteredChildren = parentJSXElement.children.filter((child: TSESTree.JSXChild) => {
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
}

export default rule
