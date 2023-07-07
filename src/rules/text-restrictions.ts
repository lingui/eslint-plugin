import { RuleContext } from '@typescript-eslint/utils/dist/ts-eslint/Rule'
import { TSESTree } from '@typescript-eslint/utils'

import { getQuasisValue, isNodeTranslated } from '../helpers'

type Rule = {
  patterns: RegExp[]
  flags: string
  message: string
  isOnlyForTranslation: boolean
}

type Option = {
  rules: Rule[]
}

module.exports = {
  meta: {
    docs: {
      description: 'Text restrictions',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      default: '{{ message }}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          rules: {
            type: 'array',
            items: {
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
                message: {
                  type: 'string',
                },
                isOnlyForTranslation: {
                  type: 'boolean',
                },
              },
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: function (context: RuleContext<string, Option[]>) {
    const {
      options: [option],
    } = context
    if (option && option.rules) {
      const { rules } = option

      const rulePatterns = rules.map(
        ({
          patterns,
          message,
          flags,
          isOnlyForTranslation,
        }: {
          patterns: RegExp[]
          message: string
          flags: string
          isOnlyForTranslation: boolean
        }) => ({
          patterns: patterns.map((item: RegExp) => new RegExp(item, flags)),
          message,
          isOnlyForTranslation,
        }),
      )

      const onLiteral = (
        value: string,
        node: TSESTree.TemplateLiteral | TSESTree.Literal | TSESTree.JSXText,
      ) => {
        rulePatterns.forEach(
          ({
            patterns,
            message,
            isOnlyForTranslation,
          }: {
            patterns: RegExp[]
            message: string
            isOnlyForTranslation: boolean
          }) => {
            if (isOnlyForTranslation && !isNodeTranslated(node)) {
              return
            }
            if (
              patterns.some((item: RegExp) => {
                return item.test(value)
              })
            ) {
              context.report({ node, messageId: 'default', data: { message: message } })
            }
          },
        )
      }
      return {
        'TemplateLiteral:exit'(node: TSESTree.TemplateLiteral) {
          const quasisValue = getQuasisValue(node)
          onLiteral(quasisValue.trim(), node)
          return
        },

        'Literal, JSXText'(node: TSESTree.Literal | TSESTree.JSXText) {
          if (node.value) {
            const trimed = node.value.toString().trim()
            onLiteral(trimed, node)
          }
          return
        },
      }
    }
  },
}
