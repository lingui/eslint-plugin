import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'
import {
  findJSXAttribute,
  getIdentifierName,
  isJSXAttribute,
  isLiteral,
  LinguiIcuComponentQuery,
  LinguiTransQuery,
} from '../helpers'

export const name = 'no-unnamed-tag-placeholders'

export type NoUnnamedTagPlaceholdersOption = {
  /**
   * The attribute name used to assign an explicit placeholder name to a JSX element inside `<Trans>`.
   */
  jsxPlaceholderAttribute?: string
  /**
   * A map of JSX tag names to placeholder names (or an array of allowed tag names) that are
   * permitted without an explicit placeholder attribute.
   */
  jsxPlaceholderDefaults?: Record<string, string> | string[]
}

export type Options = [NoUnnamedTagPlaceholdersOption]

/**
 * Recursively stringifies a JSX member expression.
 *
 * For example:
 * - `<UI.Button>` -> `"UI.Button"`
 * - `<DesignSystem.UI.Button>` -> `"DesignSystem.UI.Button"`
 */
function formatJsxMemberExpression(node: TSESTree.JSXMemberExpression): string {
  const object =
    node.object.type === TSESTree.AST_NODE_TYPES.JSXMemberExpression
      ? formatJsxMemberExpression(node.object)
      : node.object.name
  return `${object}.${node.property.name}`
}

/**
 * Resolves the tag name of a JSX opening element.
 *
 * For example:
 * - `<a>` -> `"a"`
 * - `<UI.Button>` -> `"UI.Button"`
 * - `<svg:path>` -> `"svg:path"`
 */
function getJsxTagName(openingElement: TSESTree.JSXOpeningElement): string | null {
  const name = openingElement.name
  const identifierName = getIdentifierName(name)
  if (identifierName) {
    return identifierName
  }
  if (name.type === TSESTree.AST_NODE_TYPES.JSXMemberExpression) {
    return formatJsxMemberExpression(name)
  }
  if (name.type === TSESTree.AST_NODE_TYPES.JSXNamespacedName) {
    return `${name.namespace.name}:${name.name.name}`
  }
  return null
}

const ICU_MACROS = ['Plural', 'Select', 'SelectOrdinal']
const LINGUI_MACROS = ['Trans', ...ICU_MACROS]

const ICU_NON_MESSAGE_PROPS = [
  'value',
  'offset',
  'id',
  'comment',
  'context',
  'render',
  'values',
  'components',
  'format',
  'i18n',
]

/**
 * Checks whether a JSX element is passed as an attribute prop value rather than
 * being a child element within the message stream.
 *
 * For example:
 * - `Icon` is ignored in `<Trans><Button icon={<Icon />} /></Trans>` because it is
 *   an attribute value on a regular component.
 * - But `a` in `<Plural one={<a href="...">1</a>} other="..." />` IS part of the
 *   message stream and will not be ignored.
 */
function shouldIgnoreInJsxAttribute(node: TSESTree.Node): boolean {
  let curr: TSESTree.Node | undefined = node.parent
  while (curr) {
    if (!isJSXAttribute(curr)) {
      curr = curr.parent
      continue
    }

    // Normally we ignore JSX elements within attributes, except for ICU macros.
    // Because these macros do not take namespaced JSX elements as part of their
    // message generation, we can safely ignore namespaced attributes.
    if (curr.name.type === TSESTree.AST_NODE_TYPES.JSXNamespacedName) return true

    // Since `curr` is an attribute, this gets the tag name for the JSX element
    // wrapping the node from which `curr` is an attribute to.
    // e.g. `<Foo><Bar attr="val" /></Foo>` -> "Foo"
    const parentTagName = getJsxTagName(curr.parent.parent.openingElement)

    // If this is an attribute, but it's not an ICU macro, we can ignore it.
    // Otherwise, if the attribute name doesn't match one of the "safe" options,
    // then we can't ignore it.
    return !ICU_MACROS.includes(parentTagName) || ICU_NON_MESSAGE_PROPS.includes(curr.name.name)
  }
  return false
}

/**
 * Checks whether a tag name matches the configured default placeholders.
 *
 * Supports:
 * - `Record<string, string>`: object mapping tag names to placeholder names (mirrors `macro.jsxPlaceholderDefaults` from `lingui.config`).
 * - `string[]`: array of allowed tag names (convenient shorthand for ESLint configs).
 */
function matchesPlaceholderDefaults(
  tagName: string,
  defaults?: Record<string, string> | string[],
): boolean {
  if (!defaults) return false
  if (Array.isArray(defaults)) return defaults.includes(tagName)
  return !!defaults[tagName]
}

/**
 * Checks whether an element specifies a non-empty placeholder attribute.
 */
function hasValidPlaceholderAttribute(node: TSESTree.JSXElement, attributeName?: string): boolean {
  if (!attributeName) return false
  const attr = findJSXAttribute(node, attributeName)
  if (!attr?.value) return false

  if (isLiteral(attr.value)) {
    return typeof attr.value.value === 'string' && !!attr.value.value.trim()
  }

  if (attr.value.type !== TSESTree.AST_NODE_TYPES.JSXExpressionContainer) return false

  const { expression } = attr.value
  if (isLiteral(expression)) {
    return typeof expression.value === 'string' && !!expression.value.trim()
  }
  // We trust the expression, whatever it may be, has a valid value.
  // This can be useful for cases where the code owners use a global variable
  // to keep consistent placeholders, avoid typos, and enable quick refactors.
  return expression.type !== TSESTree.AST_NODE_TYPES.JSXEmptyExpression
}

export const rule = createRule<Options, 'default'>({
  name,
  meta: {
    docs: {
      description: 'disallow unnamed tag placeholders inside Trans component',
      recommended: 'error',
    },
    messages: {
      default:
        'Tag <{{ name }}> inside <Trans> must have an explicit placeholder attribute or be configured in jsxPlaceholderDefaults to avoid numbered placeholders',
    },
    schema: [
      {
        type: 'object',
        properties: {
          jsxPlaceholderAttribute: {
            type: 'string',
          },
          jsxPlaceholderDefaults: {
            anyOf: [
              {
                type: 'object',
                additionalProperties: {
                  type: 'string',
                },
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            ],
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
    const placeholderAttr = option?.jsxPlaceholderAttribute
    const placeholderDefaults = option?.jsxPlaceholderDefaults

    return {
      [`${LinguiTransQuery} JSXElement, ${LinguiIcuComponentQuery} JSXElement`](
        node: TSESTree.JSXElement,
      ) {
        const tagName = getJsxTagName(node.openingElement)
        if (!tagName) return
        if (LINGUI_MACROS.includes(tagName)) return
        if (shouldIgnoreInJsxAttribute(node)) return

        const matchesDefault = matchesPlaceholderDefaults(tagName, placeholderDefaults)
        const hasAttr = hasValidPlaceholderAttribute(node, placeholderAttr)

        if (!matchesDefault && !hasAttr) {
          context.report({
            node,
            messageId: 'default',
            data: {
              name: tagName,
            },
          })
        }
      },
    }
  },
})
