import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import { LinguiTransQuery } from '../helpers'

export type Option = {
  patterns?: string[]
  flags?: string
}

export const name = 'require-trans-id'
export const rule = createRule<Option[], string>({
  name,
  meta: {
    docs: {
      description: "enforce 'id' attribute on Trans components",
      recommended: 'error',
    },
    messages: {
      default: "Trans component requires an explicit 'id' attribute",
      invalidPattern: "Trans component 'id' must match one of the patterns: {{ patterns }}",
    },
    schema: [
      {
        type: 'object',
        properties: {
          patterns: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          flags: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context) {
    const {
      options: [option],
    } = context

    const rulePatterns = option?.patterns?.map(
      (pattern: string) => new RegExp(pattern, option?.flags),
    )

    return {
      [LinguiTransQuery](node: TSESTree.JSXElement) {
        const idAttr = node.openingElement.attributes.find(
          (attr): attr is TSESTree.JSXAttribute =>
            attr.type === TSESTree.AST_NODE_TYPES.JSXAttribute &&
            attr.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier &&
            attr.name.name === 'id',
        )

        if (!idAttr) {
          context.report({
            node,
            messageId: 'default',
          })
          return
        }

        // Only validate string literal values; skip expressions silently
        if (
          !rulePatterns?.length ||
          !idAttr.value ||
          idAttr.value.type !== TSESTree.AST_NODE_TYPES.Literal ||
          typeof idAttr.value.value !== 'string'
        ) {
          return
        }

        const idValue = idAttr.value.value

        if (!rulePatterns.some((pattern: RegExp) => pattern.test(idValue))) {
          context.report({
            node: idAttr,
            messageId: 'invalidPattern',
            data: { patterns: option!.patterns!.join(', ') },
          })
        }
      },
    }
  },
})
