import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import {
  findJSXAttribute,
  findObjectProperty,
  LinguiCallExpressionQuery,
  LinguiIcuComponentQuery,
  LinguiTaggedTemplateExpressionMessageQuery,
  LinguiTransQuery,
} from '../helpers'

export type Option = {
  patterns?: string[]
  flags?: string
}

export const name = 'require-explicit-id'
export const rule = createRule<Option[], string>({
  name,
  meta: {
    docs: {
      description: "enforce 'id' property or attribute for Lingui macros and components",
      recommended: 'error',
    },
    messages: {
      default: "Trans component requires an explicit 'id' attribute",
      missingIdIcu: "Lingui ICU component requires an explicit 'id' attribute",
      missingIdCall: "Macro function call requires an explicit 'id' property",
      noIdInTaggedTemplate:
        "Tagged template literal doesn't support 'id'. Use {{ fn }}({ id: '...', message: '...' }) instead",
      invalidPattern: "'id' must match one of the patterns: {{ patterns }}",
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

    const flags = option?.flags
    const rulePatterns = option?.patterns?.map((pattern: string) => new RegExp(pattern, flags))

    function validatePattern(node: TSESTree.Node, idValue: string) {
      if (!rulePatterns?.length) {
        return
      }

      if (!rulePatterns.some((pattern: RegExp) => pattern.test(idValue))) {
        context.report({
          node,
          messageId: 'invalidPattern',
          data: { patterns: option!.patterns!.join(', ') },
        })
      }
    }

    function checkJSXId(node: TSESTree.JSXElement, missingMessageId: string) {
      const idAttr = findJSXAttribute(node, 'id')

      if (!idAttr) {
        context.report({ node, messageId: missingMessageId })
        return
      }

      let idValue: string | null = null
      const attrVal = idAttr.value

      if (attrVal?.type === TSESTree.AST_NODE_TYPES.Literal && typeof attrVal.value === 'string') {
        idValue = attrVal.value
      } else if (attrVal?.type === TSESTree.AST_NODE_TYPES.JSXExpressionContainer) {
        const expr = attrVal.expression
        if (expr.type === TSESTree.AST_NODE_TYPES.Literal && typeof expr.value === 'string') {
          idValue = expr.value
        }
      }

      if (idValue == null) {
        return
      }

      validatePattern(idAttr, idValue)
    }

    return {
      [LinguiTransQuery](node: TSESTree.JSXElement) {
        checkJSXId(node, 'default')
      },

      [LinguiIcuComponentQuery](node: TSESTree.JSXElement) {
        checkJSXId(node, 'missingIdIcu')
      },

      [LinguiTaggedTemplateExpressionMessageQuery](node: TSESTree.TemplateLiteral) {
        const parent = node.parent as TSESTree.TaggedTemplateExpression
        // The AST query guarantees tag is an Identifier (t, msg, defineMessage)
        const fn = (parent.tag as TSESTree.Identifier).name

        context.report({
          node: parent,
          messageId: 'noIdInTaggedTemplate',
          data: { fn },
        })
      },

      [LinguiCallExpressionQuery](node: TSESTree.CallExpression) {
        const arg = node.arguments[0]

        if (!arg || arg.type !== TSESTree.AST_NODE_TYPES.ObjectExpression) {
          return
        }

        const idProp = findObjectProperty(arg, 'id')

        if (!idProp) {
          context.report({
            node,
            messageId: 'missingIdCall',
          })
          return
        }

        // Only validate string literal values; skip expressions silently
        if (
          idProp.value.type !== TSESTree.AST_NODE_TYPES.Literal ||
          typeof idProp.value.value !== 'string'
        ) {
          return
        }

        validatePattern(idProp, idProp.value.value)
      },
    }
  },
})
