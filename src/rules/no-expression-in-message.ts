import { TSESTree } from '@typescript-eslint/utils'
import {
  LinguiCallExpressionMessageQuery,
  LinguiTaggedTemplateExpressionMessageQuery,
  LinguiTransQuery,
} from '../helpers'
import { createRule } from '../create-rule'

export const name = 'no-expression-in-message'
export const rule = createRule({
  name: 'no-expression-in-message',
  meta: {
    docs: {
      description: "doesn't allow functions or member expressions in templates",
      recommended: 'error',
    },
    messages: {
      default: 'Should be ${variable}, not ${object.property} or ${myFunction()}',
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
  create: function (context) {
    const linguiMacroFunctionNames = ['plural', 'select', 'selectOrdinal', 'ph']

    function checkExpressionsInTplLiteral(node: TSESTree.TemplateLiteral) {
      node.expressions.forEach((expression) => checkExpression(expression))
    }

    function checkExpression(expression: TSESTree.Expression) {
      if (expression.type === TSESTree.AST_NODE_TYPES.Identifier) {
        return
      }

      const isCallToLinguiMacro =
        expression.type === TSESTree.AST_NODE_TYPES.CallExpression &&
        expression.callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
        linguiMacroFunctionNames.includes(expression.callee.name)

      if (isCallToLinguiMacro) {
        return
      }

      const isExplicitLabel =
        expression.type === TSESTree.AST_NODE_TYPES.ObjectExpression &&
        expression.properties.length === 1

      if (isExplicitLabel) {
        return
      }

      context.report({
        node: expression,
        messageId: 'default',
      })
    }

    return {
      [`${LinguiTaggedTemplateExpressionMessageQuery}, ${LinguiCallExpressionMessageQuery}`](
        node: TSESTree.TemplateLiteral | TSESTree.Literal,
      ) {
        if (node.type === TSESTree.AST_NODE_TYPES.Literal) {
          return
        }

        checkExpressionsInTplLiteral(node)
      },
      [`${LinguiTransQuery} JSXExpressionContainer:not([parent.type=JSXAttribute]) > :expression`](
        node: TSESTree.Expression,
      ) {
        if (node.type === TSESTree.AST_NODE_TYPES.Literal) {
          // skip strings as expression in JSX, including spaces {' '}
          return
        }

        if (node.type === TSESTree.AST_NODE_TYPES.TemplateLiteral) {
          // <Trans>{`How much is ${obj.prop}?`}</Trans>
          return checkExpressionsInTplLiteral(node)
        }

        if (node.type === TSESTree.AST_NODE_TYPES.ObjectExpression) {
          // <Trans>Hello {{name: obj.prop}}</Trans>
          return checkExpression(node)
        }

        if (node.type === TSESTree.AST_NODE_TYPES.CallExpression) {
          // <Trans>Hello {ph({name: obj.prop})}</Trans>
          return checkExpression(node)
        }

        if (node.type !== TSESTree.AST_NODE_TYPES.Identifier) {
          context.report({
            node,
            messageId: 'default',
          })
        }
      },
    }
  },
})
