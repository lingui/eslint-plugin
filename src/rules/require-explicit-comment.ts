import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import {
  LinguiCallExpressionQuery,
  LinguiPluralComponentQuery,
  LinguiSelectComponentQuery,
  LinguiSelectOrdinalComponentQuery,
  LinguiTaggedTemplateExpressionMessageQuery,
  LinguiTransQuery,
} from '../helpers'

export const name = 'require-explicit-comment'
export const rule = createRule<[], string>({
  name,
  meta: {
    docs: {
      description:
        "enforce 'comment' property or attribute for Lingui macros, unless 'context' is provided",
      recommended: 'error',
    },
    messages: {
      missingCommentJsx:
        '{{ component }} requires an explicit `comment` prop when `context` is absent',
      missingCommentCall:
        "Macro function call requires an explicit 'comment' property when 'context' is absent",
      noCommentInTaggedTemplate:
        "Tagged template literal doesn't support 'comment'. Use {{ fn }}({ comment: '...', message: '...' }) or provide `context` instead",
    },
    schema: [],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context) {
    const getJSXProp = (node: TSESTree.JSXElement, propName: string) =>
      node.openingElement.attributes.find(
        (attr): attr is TSESTree.JSXAttribute =>
          attr.type === TSESTree.AST_NODE_TYPES.JSXAttribute &&
          attr.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier &&
          attr.name.name === propName,
      )

    const getObjectProp = (node: TSESTree.ObjectExpression, propName: string) =>
      node.properties.find(
        (prop): prop is TSESTree.Property =>
          prop.type === TSESTree.AST_NODE_TYPES.Property &&
          ((prop.key.type === TSESTree.AST_NODE_TYPES.Identifier && prop.key.name === propName) ||
            (prop.key.type === TSESTree.AST_NODE_TYPES.Literal && prop.key.value === propName)),
      )

    const checkJSXComment = (node: TSESTree.JSXElement) => {
      const hasContext = Boolean(getJSXProp(node, 'context'))
      if (hasContext) {
        return
      }

      const hasComment = Boolean(getJSXProp(node, 'comment'))
      if (hasComment) {
        return
      }

      const component =
        node.openingElement.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier
          ? node.openingElement.name.name
          : 'Component'

      context.report({
        node,
        messageId: 'missingCommentJsx',
        data: { component },
      })
    }

    return {
      [LinguiTransQuery](node: TSESTree.JSXElement) {
        checkJSXComment(node)
      },

      [LinguiPluralComponentQuery](node: TSESTree.JSXElement) {
        checkJSXComment(node)
      },

      [LinguiSelectComponentQuery](node: TSESTree.JSXElement) {
        checkJSXComment(node)
      },

      [LinguiSelectOrdinalComponentQuery](node: TSESTree.JSXElement) {
        checkJSXComment(node)
      },

      [LinguiTaggedTemplateExpressionMessageQuery](node: TSESTree.TemplateLiteral) {
        const parent = node.parent as TSESTree.TaggedTemplateExpression
        const fn =
          parent.tag.type === TSESTree.AST_NODE_TYPES.Identifier ? parent.tag.name : 'function'

        context.report({
          node: parent,
          messageId: 'noCommentInTaggedTemplate',
          data: { fn },
        })
      },

      [LinguiCallExpressionQuery](node: TSESTree.CallExpression) {
        const arg = node.arguments[0]

        if (!arg || arg.type !== TSESTree.AST_NODE_TYPES.ObjectExpression) {
          return
        }

        const hasContext = Boolean(getObjectProp(arg, 'context'))
        if (hasContext) {
          return
        }

        const hasComment = Boolean(getObjectProp(arg, 'comment'))
        if (hasComment) {
          return
        }

        context.report({
          node,
          messageId: 'missingCommentCall',
        })
      },
    }
  },
})
