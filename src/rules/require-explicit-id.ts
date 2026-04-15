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
  patterns?: string[]
  flags?: string
}

export const name = 'require-explicit-id'
export const rule = createRule<Option[], string>({
  name,
  meta: {
    docs: {
      description: "enforce 'id' property or attribute for Lingui macros",
      recommended: 'error',
    },
    messages: {
      default: "Trans component requires an explicit 'id' attribute",
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

    const rulePatterns = option?.patterns?.map(
      (pattern: string) => new RegExp(pattern, option?.flags),
    )

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

    return {
      [LinguiTransQuery](node: TSESTree.JSXElement) {
        const idAttr = findJSXAttribute(node, 'id')

        if (!idAttr) {
          context.report({
            node,
            messageId: 'default',
          })
          return
        }

        // Only validate string literal values; skip complex expressions silently
        let idValue: string | null = null
        const attVal = idAttr.value;
        if (
          idAttr.value &&
          idAttr.value.type === TSESTree.AST_NODE_TYPES.Literal &&
          typeof idAttr.value.value === 'string'
        ) {
          idValue = idAttr.value.value
        } else if (
          idAttr.value &&
          idAttr.value.type === TSESTree.AST_NODE_TYPES.JSXExpressionContainer &&
          idAttr.value.expression.type === TSESTree.AST_NODE_TYPES.Literal &&
          typeof idAttr.value.expression.value === 'string'
        ) {
          // Handle id={"msg.hello"} the same as id="msg.hello"
          idValue = idAttr.value.expression.value
        }

        if (idValue == null) {
          return
        }

        validatePattern(idAttr, idValue)
      },

      [LinguiTaggedTemplateExpressionMessageQuery](node: TSESTree.TemplateLiteral) {
        const parent = node.parent as TSESTree.TaggedTemplateExpression
        const fn =
          parent.tag.type === TSESTree.AST_NODE_TYPES.Identifier ? parent.tag.name : 'function'

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
