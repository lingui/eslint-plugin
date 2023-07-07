import { TSESTree } from '@typescript-eslint/utils'
import { RuleContext } from '@typescript-eslint/utils/dist/ts-eslint/Rule'
import { getNearestAncestor, isTTaggedTemplateExpression } from '../helpers'

module.exports = {
  meta: {
    docs: {
      description: "doesn't allow functions or member expressions in templates",
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      default: 'Should be ${variable}, not ${object.property} or ${my_function()}',
    },
    schema: [
      {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    ],
  },

  create: function (context: RuleContext<string, readonly unknown[]>) {
    return {
      'TemplateLiteral:exit'(node: TSESTree.TemplateLiteral) {
        const noneIdentifierExpressions = node.expressions
          ? node.expressions.filter((expression: { type: string }) => {
              return expression.type !== TSESTree.AST_NODE_TYPES.Identifier
            })
          : []

        const taggedTemplate = getNearestAncestor<TSESTree.TaggedTemplateExpression>(
          node,
          'TaggedTemplateExpression',
        )

        if (
          noneIdentifierExpressions.length > 0 &&
          taggedTemplate &&
          isTTaggedTemplateExpression(taggedTemplate)
        ) {
          context.report({
            node: node,
            messageId: 'default',
          })
        }

        return
      },
    }
  },
}
