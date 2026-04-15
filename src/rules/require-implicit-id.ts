import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import {
  findJSXAttribute,
  findObjectProperty,
  LinguiCallExpressionQuery,
  LinguiTaggedTemplateExpressionMessageQuery,
  LinguiTransQuery,
} from '../helpers'

export type Option = {
  requireContext?: boolean
}

export const name = 'require-implicit-id'


export const rule = createRule<Option[], string>({
  name,
  meta: {
    docs: {
      description:
        "forbid explicit 'id' for Lingui macros and optionally require 'context' for disambiguation",
      recommended: 'error',
    },
    messages: {
      forbiddenIdTrans:
        "<Trans> must not have an explicit 'id' attribute; use auto-generated IDs instead",
      forbiddenIdCall:
        "Macro function call must not have an explicit 'id' property; use auto-generated IDs instead",
      missingContextTrans:
        "<Trans> requires a 'context' attribute to disambiguate translations",
      missingContextCall:
        "Macro function call requires a 'context' property to disambiguate translations",
      noContextInTaggedTemplate:
        "Tagged template literal doesn't support 'context'. Use {{ fn }}({ message: '...', context: '...' }) instead",
    },
    schema: [
      {
        type: 'object',
        properties: {
          requireContext: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context) {
    const requireContext = context.options[0]?.requireContext ?? false

    return {
      [LinguiTransQuery](node: TSESTree.JSXElement) {
        if (findJSXAttribute(node, 'id')) {
          context.report({ node: findJSXAttribute(node, 'id')!, messageId: 'forbiddenIdTrans' })
        }

        if (requireContext && !findJSXAttribute(node, 'context')) {
          context.report({ node, messageId: 'missingContextTrans' })
        }
      },

      [LinguiTaggedTemplateExpressionMessageQuery](node: TSESTree.TemplateLiteral) {
        if (!requireContext) return

        const parent = node.parent as TSESTree.TaggedTemplateExpression
        // The AST query guarantees tag is an Identifier (t, msg, defineMessage)
        const fn = (parent.tag as TSESTree.Identifier).name

        context.report({
          node: parent,
          messageId: 'noContextInTaggedTemplate',
          data: { fn },
        })
      },

      [LinguiCallExpressionQuery](node: TSESTree.CallExpression) {
        const arg = node.arguments[0]

        if (!arg || arg.type !== TSESTree.AST_NODE_TYPES.ObjectExpression) {
          return
        }

        if (findObjectProperty(arg, 'id')) {
          context.report({ node: findObjectProperty(arg, 'id')!, messageId: 'forbiddenIdCall' })
        }

        if (requireContext && !findObjectProperty(arg, 'context')) {
          context.report({ node, messageId: 'missingContextCall' })
        }
      },
    }
  },
})

