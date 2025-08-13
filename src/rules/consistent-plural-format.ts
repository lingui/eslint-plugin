import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'

export const name = 'consistent-plural-format'

type Options = [
  {
    style?: 'hash' | 'template'
  }
]

export const rule = createRule<Options, 'hashRequired' | 'templateRequired'>({
  name: 'consistent-plural-format',
  meta: {
    docs: {
      description: 'Enforce consistent format for plural definitions',
      recommended: 'error',
    },
    messages: {
      hashRequired: 'Use hash format (e.g., "# book") instead of template literals in plural definitions',
      templateRequired: 'Use template literal format (e.g., `${variable} book`) instead of hash format in plural definitions',
    },
    schema: [
      {
        type: 'object',
        properties: {
          style: {
            type: 'string',
            enum: ['hash', 'template'],
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem' as const,
  },

  defaultOptions: [{ style: 'hash' }],
  create: function (context) {
    const options = context.options[0] || {}
    const preferredStyle = options.style || 'hash'

    function isPluralCall(node: TSESTree.CallExpression): boolean {
      return (
        node.callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
        node.callee.name === 'plural'
      )
    }

    function isPluralComponent(node: TSESTree.JSXElement): boolean {
      return (
        node.openingElement.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier &&
        node.openingElement.name.name === 'Plural'
      )
    }

    function checkStringValue(value: string, node: TSESTree.Node) {
      const hasHashFormat = value.includes('#')
      const hasTemplateLiteralPattern = /\$\{[^}]+\}/.test(value)

      if (preferredStyle === 'hash') {
        // If it doesn't have hash format but has template literal pattern in string
        if (!hasHashFormat && hasTemplateLiteralPattern) {
          context.report({
            node,
            messageId: 'hashRequired',
          })
        }
      } else if (preferredStyle === 'template') {
        // If it has hash format, it should use template literals instead
        if (hasHashFormat) {
          context.report({
            node,
            messageId: 'templateRequired',
          })
        }
      }
    }

    function checkPluralObject(objectNode: TSESTree.ObjectExpression) {
      objectNode.properties.forEach((property) => {
        if (property.type === TSESTree.AST_NODE_TYPES.Property) {
          // Handle template literals
          if (property.value.type === TSESTree.AST_NODE_TYPES.TemplateLiteral) {
            if (preferredStyle === 'hash') {
              context.report({
                node: property.value,
                messageId: 'hashRequired',
              })
            }
          }
          // Handle string literals
          else if (
            property.value.type === TSESTree.AST_NODE_TYPES.Literal &&
            typeof property.value.value === 'string'
          ) {
            checkStringValue(property.value.value, property.value)
          }
        }
      })
    }

    function checkPluralComponentAttributes(node: TSESTree.JSXElement) {
      const attributes = node.openingElement.attributes

      attributes.forEach((attr) => {
        if (
          attr.type === TSESTree.AST_NODE_TYPES.JSXAttribute &&
          attr.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier &&
          (attr.name.name === 'one' || attr.name.name === 'other' || attr.name.name === 'zero' || attr.name.name === 'few' || attr.name.name === 'many')
        ) {
          if (attr.value) {
            // Handle string literals
            if (
              attr.value.type === TSESTree.AST_NODE_TYPES.Literal &&
              typeof attr.value.value === 'string'
            ) {
              checkStringValue(attr.value.value, attr.value)
            }
            // Handle JSX expressions with template literals
            else if (
              attr.value.type === TSESTree.AST_NODE_TYPES.JSXExpressionContainer &&
              attr.value.expression.type === TSESTree.AST_NODE_TYPES.TemplateLiteral
            ) {
              if (preferredStyle === 'hash') {
                context.report({
                  node: attr.value.expression,
                  messageId: 'hashRequired',
                })
              }
            }
          }
        }
      })
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (!isPluralCall(node)) {
          return
        }

        // Check if the second argument is an object expression
        if (
          node.arguments.length >= 2 &&
          node.arguments[1].type === TSESTree.AST_NODE_TYPES.ObjectExpression
        ) {
          checkPluralObject(node.arguments[1])
        }
      },
      JSXElement(node: TSESTree.JSXElement) {
        if (!isPluralComponent(node)) {
          return
        }

        checkPluralComponentAttributes(node)
      },
    }
  },
})
