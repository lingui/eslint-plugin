import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import { collectLinguiDirectives, findDirectiveForLine, LinguiDirective } from '../directives'

import {
  findJSXAttribute,
  findObjectProperty,
  getIdentifierName,
  getStaticStringValue,
  isRuntimeValue,
  LinguiCallExpressionQuery,
  LinguiIcuComponentQuery,
  LinguiTaggedTemplateExpressionQuery,
  LinguiTransQuery,
} from '../helpers'

export const name = 'require-comment'

export type RequireCommentOption = {
  /**
   * Regular expression sources whose matches are stripped from a comment before the rule
   * checks that a description for translators is left.
   */
  ignorePatterns?: string[]
  /**
   * Flags passed to the `RegExp` constructor together with each pattern of `ignorePatterns`.
   */
  flags?: string
  /**
   * Whether a `context` value satisfies the rule on its own.
   */
  allowContext?: boolean
}

export type Options = [RequireCommentOption]

type MessageIds =
  | 'missingCommentJsx'
  | 'missingCommentCall'
  | 'missingCommentTaggedTemplate'
  | 'emptyComment'
  | 'uninformativeComment'

const MACRO_COMPONENTS = ['Trans', 'Plural', 'Select', 'SelectOrdinal']

/**
 * Checks whether a macro component is nested inside another macro component.
 *
 * A nested macro is part of the message of its parent, as in
 * `<Trans comment="...">You have <Plural value={n} one="# task" other="# tasks" /></Trans>`,
 * so only the outermost macro carries a comment for translators.
 */
function isNestedMacroComponent(node: TSESTree.JSXElement): boolean {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (
      parent.type === TSESTree.AST_NODE_TYPES.JSXElement &&
      MACRO_COMPONENTS.includes(getIdentifierName(parent.openingElement.name) ?? '')
    ) {
      return true
    }
  }
  return false
}

/** Adds the global flag, without which only the first match of a pattern would be stripped. */
function withGlobalFlag(flags = ''): string {
  return flags.includes('g') ? flags : `${flags}g`
}

export const rule = createRule<Options, MessageIds>({
  name,
  meta: {
    docs: {
      description: "enforce 'comment' for Lingui macros and components",
      recommended: 'error',
    },
    messages: {
      missingCommentJsx:
        "{{ component }} requires a 'comment' attribute, or a '// lingui-set comment=\"...\"' directive, to give translators context",
      missingCommentCall:
        "Macro function call requires a 'comment' property, or a '// lingui-set comment=\"...\"' directive, to give translators context",
      missingCommentTaggedTemplate:
        "Tagged template literal doesn't support 'comment'. Use {{ fn }}({ message: '...', comment: '...' }) or a '// lingui-set comment=\"...\"' directive instead",
      emptyComment: "'comment' must not be empty",
      uninformativeComment:
        "'comment' must describe the message for translators, not only match the ignored patterns: {{ patterns }}",
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignorePatterns: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          flags: {
            type: 'string',
          },
          allowContext: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem' as const,
  },

  defaultOptions: [{}],

  create: function (context) {
    const [option] = context.options
    const allowContext = option?.allowContext ?? false
    const ignorePatternSources = option?.ignorePatterns ?? []
    const ignorePatterns = ignorePatternSources.map(
      (pattern) => new RegExp(pattern, withGlobalFlag(option?.flags)),
    )

    const sourceCode = context.sourceCode ?? context.getSourceCode()
    let directives: LinguiDirective[] | undefined

    /** Comments are only scanned for files that declare a message without describing it. */
    function getDirectives(): LinguiDirective[] {
      return (directives ??= collectLinguiDirectives(sourceCode.getAllComments()))
    }

    /** Removes everything the configuration considers metadata rather than a description. */
    function stripIgnoredPatterns(text: string): string {
      return ignorePatterns.reduce((result, pattern) => result.replace(pattern, ''), text)
    }

    /** A comment only helps translators if something is left once metadata is stripped. */
    function isDescriptive(text: string | undefined): boolean {
      return !!text && !!stripIgnoredPatterns(text).trim()
    }

    /**
     * Checks whether a `context` value can stand in for a comment. Values that can't be
     * resolved statically are trusted, blank or non-string ones are not.
     */
    function hasUsableContext(node: TSESTree.Node | null | undefined): boolean {
      if (!allowContext || !node) return false
      if (isRuntimeValue(node)) return true
      const text = getStaticStringValue(node)
      return !!text?.trim()
    }

    /** Checks whether a directive in effect on the given line already provides the context. */
    function hasDirectiveContext(line: number): boolean {
      const values = findDirectiveForLine(getDirectives(), line)

      return isDescriptive(values?.comment) || (allowContext && !!values?.context?.trim())
    }

    /**
     * Reports a comment that is present but says nothing to translators. Values that can't be
     * resolved statically, such as `comment={hint}`, are trusted.
     */
    function checkCommentValue(node: TSESTree.Node, value: TSESTree.Node | null | undefined) {
      if (isRuntimeValue(value)) return

      const text = getStaticStringValue(value)
      if (!text?.trim()) {
        context.report({ node, messageId: 'emptyComment' })
        return
      }

      if (!isDescriptive(text)) {
        context.report({
          node,
          messageId: 'uninformativeComment',
          data: { patterns: ignorePatternSources.join(', ') },
        })
      }
    }

    return {
      [`${LinguiTransQuery}, ${LinguiIcuComponentQuery}`](node: TSESTree.JSXElement) {
        if (isNestedMacroComponent(node)) return

        const commentAttr = findJSXAttribute(node, 'comment')
        if (commentAttr) {
          checkCommentValue(commentAttr, commentAttr.value)
          return
        }

        if (hasUsableContext(findJSXAttribute(node, 'context')?.value)) return
        if (hasDirectiveContext(node.loc.start.line)) return

        context.report({
          node,
          messageId: 'missingCommentJsx',
          data: { component: getIdentifierName(node.openingElement.name) ?? 'Component' },
        })
      },

      [LinguiCallExpressionQuery](node: TSESTree.CallExpression) {
        const arg = node.arguments[0]

        // Skip the forms that don't carry a message descriptor, such as `t(i18n)`.
        if (arg?.type !== TSESTree.AST_NODE_TYPES.ObjectExpression) return

        const commentProperty = findObjectProperty(arg, 'comment')
        if (commentProperty) {
          checkCommentValue(commentProperty, commentProperty.value)
          return
        }

        if (hasUsableContext(findObjectProperty(arg, 'context')?.value)) return
        if (hasDirectiveContext(node.loc.start.line)) return

        context.report({ node, messageId: 'missingCommentCall' })
      },

      [LinguiTaggedTemplateExpressionQuery](node: TSESTree.TaggedTemplateExpression) {
        if (hasDirectiveContext(node.loc.start.line)) return

        context.report({
          node,
          messageId: 'missingCommentTaggedTemplate',
          // The AST query guarantees tag is an Identifier (t, msg, defineMessage)
          data: { fn: (node.tag as TSESTree.Identifier).name },
        })
      },
    }
  },
})
