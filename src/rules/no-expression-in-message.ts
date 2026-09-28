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
      default:
        'Expression `{{ expression }}` is extracted as a positional placeholder `{0}`, which gives translators no context. Wrap it in a named placeholder: `ph({ {{ label }}: {{ expression }} })`',
      multiplePlaceholders:
        'A named placeholder takes exactly one key-value pair, for example `ph({ name: value })`, but found multiple keys',
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
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    /**
     * Derive a placeholder label to show in the error message:
     * `user.name` -> `name`, `getUserName()` -> `getUserName`, anything else -> `value`
     */
    function suggestLabel(expression: TSESTree.Expression): string {
      let node: TSESTree.Node = expression

      if (node.type === TSESTree.AST_NODE_TYPES.CallExpression) {
        node = node.callee
      }

      if (node.type === TSESTree.AST_NODE_TYPES.MemberExpression && !node.computed) {
        node = node.property
      }

      if (node.type === TSESTree.AST_NODE_TYPES.Identifier) {
        return node.name
      }

      return 'value'
    }

    function reportExpression(expression: TSESTree.Expression) {
      context.report({
        node: expression,
        messageId: 'default',
        data: {
          expression: sourceCode.getText(expression),
          label: suggestLabel(expression),
        },
      })
    }

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

      const isExplicitLabel = expression.type === TSESTree.AST_NODE_TYPES.ObjectExpression

      if (isExplicitLabel) {
        // there can be only one key in the object
        if (expression.properties.length === 1) {
          return
        }
        context.report({
          node: expression,
          messageId: 'multiplePlaceholders',
        })
        return
      }

      reportExpression(expression)
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
          reportExpression(node)
        }
      },
    }
  },
})
