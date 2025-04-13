import { TSESTree } from '@typescript-eslint/utils'

import {
  getText,
  LinguiCallExpressionMessageQuery,
  LinguiTaggedTemplateExpressionMessageQuery,
  LinguiTransQuery,
} from '../helpers'
import { createRule } from '../create-rule'

export type RestrictionRule = {
  patterns: string[]
  message: string
  flags?: string
}

type RegexRule = {
  patterns: RegExp[]
  message: string
  flags?: string
}

export type Option = {
  rules: RestrictionRule[]
}

export const name = 'text-restrictions'
export const rule = createRule<Option[], string>({
  name,
  meta: {
    docs: {
      description: 'Text restrictions',
      recommended: 'error',
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

  create: function (context) {
    const {
      options: [option],
    } = context
    if (!option?.rules?.length) {
      return {}
    }

    const { rules } = option

    const rulePatterns: RegexRule[] = rules.map(
      ({ patterns, message, flags }: RestrictionRule) => ({
        patterns: patterns.map((item: string) => new RegExp(item, flags)),
        message,
      }),
    )

    return {
      [`${LinguiTaggedTemplateExpressionMessageQuery}, ${LinguiCallExpressionMessageQuery}, ${LinguiTransQuery} JSXText`](
        node: TSESTree.TemplateLiteral | TSESTree.Literal | TSESTree.JSXText,
      ) {
        const text = getText(node, node.type === TSESTree.AST_NODE_TYPES.JSXText)

        rulePatterns.forEach(({ patterns, message }: RegexRule) => {
          if (patterns.some((item: RegExp) => item.test(text))) {
            context.report({ node, messageId: 'default', data: { message: message } })
          }
        })

        return
      },
    }
  },
})
