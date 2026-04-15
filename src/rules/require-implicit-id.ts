import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import {
  findJSXAttribute,
  findObjectProperty,
  LinguiCallExpressionQuery,
  LinguiTransQuery,
} from '../helpers'

export const name = 'require-implicit-id'

export const rule = createRule<[], string>({
  name,
  meta: {
    docs: {
      description: "forbid explicit 'id' for Lingui macros",
      recommended: 'error',
    },
    messages: {
      forbiddenIdTrans:
        "<Trans> must not have an explicit 'id' attribute; use auto-generated IDs instead",
      forbiddenIdCall:
        "Macro function call must not have an explicit 'id' property; use auto-generated IDs instead",
    },
    schema: [],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context) {
    return {
      [LinguiTransQuery](node: TSESTree.JSXElement) {
        if (findJSXAttribute(node, 'id')) {
          context.report({ node: findJSXAttribute(node, 'id')!, messageId: 'forbiddenIdTrans' })
        }
      },

      [LinguiCallExpressionQuery](node: TSESTree.CallExpression) {
        const arg = node.arguments[0]

        if (!arg || arg.type !== TSESTree.AST_NODE_TYPES.ObjectExpression) {
          return
        }

        if (findObjectProperty(arg, 'id')) {
          context.report({ node: findObjectProperty(arg, 'id')!, messageId: 'forbiddenIdCall' })
        }
      },
    }
  },
})
