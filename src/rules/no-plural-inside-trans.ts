import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import { LinguiTransQuery, LinguiPluralComponentQuery } from '../helpers'

export const name = 'no-plural-inside-trans'
export const rule = createRule({
  name,
  meta: {
    docs: {
      description: 'disallow Plural components inside Trans components',
      recommended: 'error',
    },
    messages: {
      default: 'Avoid using Plural component inside Trans component.',
    },
    schema: [],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context) {
    return {
      [`${LinguiTransQuery} ${LinguiPluralComponentQuery}`](node: TSESTree.JSXElement) {
        context.report({
          node: node,
          messageId: 'default',
        })
      },
    }
  },
})
