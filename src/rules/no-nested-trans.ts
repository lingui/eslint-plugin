import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import {
  LinguiTransQuery,
  LinguiCallExpressionPluralQuery,
  LinguiPluralComponentQuery,
  LinguiCallExpressionSelectQuery,
  LinguiCallExpressionSelectOrdinalQuery,
  LinguiSelectComponentQuery,
  LinguiSelectOrdinalComponentQuery,
} from '../helpers'

export const name = 'no-nested-trans'
export const rule = createRule({
  name,
  meta: {
    docs: {
      description: 'Disallow nested translation functions and components',
      recommended: 'error',
    },
    messages: {
      default:
        'Translation functions and components cannot be nested inside each other. Found {{childType}} inside {{parentType}}.',
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
    // All Lingui translation functions and components
    const allLinguiQueries = [
      LinguiTransQuery,
      LinguiPluralComponentQuery,
      LinguiSelectComponentQuery,
      LinguiSelectOrdinalComponentQuery,
      LinguiCallExpressionPluralQuery,
      LinguiCallExpressionSelectQuery,
      LinguiCallExpressionSelectOrdinalQuery,
      'TaggedTemplateExpression[tag.name=t]',
      'TaggedTemplateExpression[tag.name=msg]',
      'TaggedTemplateExpression[tag.name=defineMessage]',
      'CallExpression[callee.name=t]',
      'CallExpression[callee.name=msg]',
      'CallExpression[callee.name=defineMessage]',
    ].join(', ')

    function getNodeType(node: TSESTree.Node): string {
      if (node.type === 'JSXElement') {
        const jsxNode = node as TSESTree.JSXElement
        if (jsxNode.openingElement.name.type === 'JSXIdentifier') {
          return `<${jsxNode.openingElement.name.name}>`
        }
      } else if (node.type === 'TaggedTemplateExpression') {
        const taggedNode = node as TSESTree.TaggedTemplateExpression
        if (taggedNode.tag.type === 'Identifier') {
          return `${taggedNode.tag.name}\`\``
        }
      } else if (node.type === 'CallExpression') {
        const callNode = node as TSESTree.CallExpression
        if (callNode.callee.type === 'Identifier') {
          return `${callNode.callee.name}()`
        }
      }
      return 'translation function'
    }

    function findParentTranslationFunction(node: TSESTree.Node): TSESTree.Node | null {
      let parent = node.parent
      while (parent) {
        // Check for JSX elements (Trans, Plural, Select, SelectOrdinal)
        if (parent.type === 'JSXElement') {
          const jsxParent = parent as TSESTree.JSXElement
          if (jsxParent.openingElement.name.type === 'JSXIdentifier') {
            const tagName = jsxParent.openingElement.name.name
            if (['Trans', 'Plural', 'Select', 'SelectOrdinal'].includes(tagName)) {
              return parent
            }
          }
        }

        // Check for function calls (plural, select, selectOrdinal, t, msg, defineMessage)
        if (parent.type === 'CallExpression') {
          const callParent = parent as TSESTree.CallExpression
          if (callParent.callee.type === 'Identifier') {
            const funcName = callParent.callee.name
            if (
              ['plural', 'select', 'selectOrdinal', 't', 'msg', 'defineMessage'].includes(funcName)
            ) {
              return parent
            }
          }
        }

        // Check for tagged template expressions (t``, msg``, defineMessage``)
        if (parent.type === 'TaggedTemplateExpression') {
          const taggedParent = parent as TSESTree.TaggedTemplateExpression
          if (taggedParent.tag.type === 'Identifier') {
            const tagName = taggedParent.tag.name
            if (['t', 'msg', 'defineMessage'].includes(tagName)) {
              return parent
            }
          }
        }

        parent = parent.parent
      }
      return null
    }

    return {
      [`${allLinguiQueries}`](node: TSESTree.Node) {
        const parentTranslationFunction = findParentTranslationFunction(node)
        if (parentTranslationFunction) {
          const childType = getNodeType(node)
          const parentType = getNodeType(parentTranslationFunction)

          context.report({
            node,
            messageId: 'default',
            data: {
              childType,
              parentType,
            },
          })
        }
      },
    }
  },
})

// Export as default for compatibility with test
export default rule
