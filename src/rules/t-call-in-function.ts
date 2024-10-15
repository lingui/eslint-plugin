import { TSESTree } from '@typescript-eslint/utils'
import { Scope, ScopeType } from '@typescript-eslint/scope-manager'
import { createRule } from '../create-rule'

export function hasAncestorScope(node: Scope, types: ScopeType[]): boolean {
  let current = node

  while (current) {
    if (types.includes(current.type)) {
      return true
    }
    current = current.upper
  }
  return false
}

export const name = 't-call-in-function'
export const rule = createRule({
  name,
  meta: {
    docs: {
      description: 'allow t call only inside functions',
      recommended: 'error',
    },
    messages: {
      default: 't`` and t() call should be inside function',
    },
    schema: [
      {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    ],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: (context) => {
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    return {
      'TaggedTemplateExpression[tag.name=t], CallExpression[callee.name=t]'(
        node: TSESTree.TaggedTemplateExpression,
      ) {
        const scope = sourceCode.getScope
          ? // available from ESLint v8.37.0
            sourceCode.getScope(node)
          : // deprecated and remove in V9
            context.getScope()

        if (!hasAncestorScope(scope, [ScopeType.function, ScopeType.classFieldInitializer])) {
          context.report({
            node,
            messageId: 'default',
          })
        }
      },
    }
  },
})
