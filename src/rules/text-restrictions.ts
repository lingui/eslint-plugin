import {
  RuleContext,
  RuleRecommendation,
  RuleModule,
} from '@typescript-eslint/utils/dist/ts-eslint/Rule'
import { TSESTree } from '@typescript-eslint/utils'

import { getQuasisValue, isNodeTranslated } from '../helpers'

export type Rule = {
  patterns: string[]
  message: string
  flags?: string
  isOnlyForTranslation?: boolean
}

type RegexRule = {
  patterns: RegExp[]
  message: string
  flags?: string
  isOnlyForTranslation?: boolean
}

export type Option = {
  rules: Rule[]
}

const rule: RuleModule<string, Option[]> = {
  meta: {
    docs: {
      description: 'Text restrictions',
      recommended: 'error' as RuleRecommendation,
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
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context: RuleContext<string, Option[]>) {
    const {
      options: [option],
    } = context
    if (option && option.rules) {
      const { rules } = option

      const rulePatterns: RegexRule[] = rules.map(
        ({ patterns, message, flags, isOnlyForTranslation }: Rule) => ({
          patterns: patterns.map((item: string) => new RegExp(item, flags)),
          message,
          isOnlyForTranslation,
        }),
      )

      const onLiteral = (
        value: string,
        node: TSESTree.TemplateLiteral | TSESTree.Literal | TSESTree.JSXText,
      ) => {
        rulePatterns.forEach(({ patterns, message, isOnlyForTranslation }: RegexRule) => {
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
        })
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

export default rule
