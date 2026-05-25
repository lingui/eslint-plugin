import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import {
  findJSXAttribute,
  findObjectProperty,
  LinguiCallExpressionQuery,
  LinguiIcuComponentQuery,
  LinguiTransQuery,
} from '../helpers'

export const name = 'require-implicit-id'

export const rule = createRule<[], string>({
  name,
  meta: {
    docs: {
      description: "forbid explicit 'id' for Lingui macros and components",
      recommended: 'error',
    },
    messages: {
      forbiddenIdTrans:
        "<Trans> must not have an explicit 'id' attribute; use auto-generated IDs instead",
      forbiddenIdIcu:
        "Lingui ICU component must not have an explicit 'id' attribute; use auto-generated IDs instead",
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
        const idAttr = findJSXAttribute(node, 'id')
        if (idAttr) {
          context.report({ node: idAttr, messageId: 'forbiddenIdTrans' })
        }
      },

      [LinguiIcuComponentQuery](node: TSESTree.JSXElement) {
        const idAttr = findJSXAttribute(node, 'id')
        if (idAttr) {
          context.report({ node: idAttr, messageId: 'forbiddenIdIcu' })
        }
      },

      [LinguiCallExpressionQuery](node: TSESTree.CallExpression) {
        const arg = node.arguments[0]

        if (!arg || arg.type !== TSESTree.AST_NODE_TYPES.ObjectExpression) {
          return
        }

        const idProperty = findObjectProperty(arg, 'id')
        if (idProperty) {
          context.report({ node: idProperty, messageId: 'forbiddenIdCall' })
        }
      },
    }
  },
})
