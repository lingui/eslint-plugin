import { TSESTree } from '@typescript-eslint/utils'
import { isTTaggedTemplateExpression } from '../helpers'
import { createRule } from '../create-rule'

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

    const visited = new WeakSet()

    const handler = (node: TSESTree.TaggedTemplateExpression) => {
      if (!isTTaggedTemplateExpression(node)) {
        return
      }

      visited.add(node)
      return
    }
    return {
      ['FunctionDeclaration TaggedTemplateExpression'](node: TSESTree.TaggedTemplateExpression) {
        handler(node)
      },

      ['FunctionExpression TaggedTemplateExpression'](node: TSESTree.TaggedTemplateExpression) {
        handler(node)
      },

      ['ArrowFunctionExpression TaggedTemplateExpression'](
        node: TSESTree.TaggedTemplateExpression,
      ) {
        handler(node)
      },

      ['ClassDeclaration TaggedTemplateExpression'](node: TSESTree.TaggedTemplateExpression) {
        handler(node)
      },
      ['CallExpression:exit'](node: TSESTree.CallExpression) {
        const scope = sourceCode.getScope
          ? // available from ESLint v8.37.0
            sourceCode.getScope(node)
          : // deprecated and remove in V9
            context.getScope()

        if (
          scope.type === 'module' &&
          node.callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
          node.callee.name === 't'
        ) {
          context.report({
            node,
            messageId: 'default',
          })
        }
      },
      ['TaggedTemplateExpression:exit'](node: TSESTree.TaggedTemplateExpression) {
        if (visited.has(node)) return
        if (!isTTaggedTemplateExpression(node)) {
          return
        }

        context.report({
          node,
          messageId: 'default',
        })
      },
    }
  },
})
