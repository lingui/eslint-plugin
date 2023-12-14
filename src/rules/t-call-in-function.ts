import { TSESTree } from '@typescript-eslint/utils'
import {
  RuleContext,
  RuleRecommendation,
  RuleModule,
} from '@typescript-eslint/utils/dist/ts-eslint/Rule'
import { isTTaggedTemplateExpression } from '../helpers'

const rule: RuleModule<string, readonly unknown[]> = {
  meta: {
    docs: {
      description: 'allow t call only inside functions',
      recommended: 'error' as RuleRecommendation,
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

  create: (context: RuleContext<string, readonly unknown[]>) => {
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
        const scope = context.getScope()
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
}

export default rule
