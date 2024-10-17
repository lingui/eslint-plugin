import {
  ESLintUtils,
  JSONSchema,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils'
import {
  getIdentifierName,
  getNearestAncestor,
  getText,
  hasAncestorWithName,
  isAllowedDOMAttr,
  isIdentifier,
  isJSXAttribute,
  isLiteral,
  isMemberExpression,
  isTemplateLiteral,
  isUpperCase,
  UpperCaseRegexp,
} from '../helpers'
import { createRule } from '../create-rule'

type MatcherDef = string | { regex: { pattern: string; flags?: string } }

export type Option = {
  ignore?: string[]
  ignoreFunction?: string[]
  ignoreAttribute?: MatcherDef[]
  strictAttribute?: MatcherDef[]
  ignoreProperty?: MatcherDef[]
  ignoreMethodsOnTypes?: string[]
  useTsTypes?: boolean
}

const MatcherSchema: JSONSchema.JSONSchema4 = {
  oneOf: [
    {
      type: 'string',
    },
    {
      type: 'object',
      properties: {
        regex: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
            },
            flags: {
              type: 'string',
            },
          },
          required: ['pattern'],
          additionalProperties: false,
        },
      },
      required: ['regex'],
      additionalProperties: false,
    },
  ],
}

function preparePatterns(items: MatcherDef[]): (string | RegExp)[] {
  return items.map((item) =>
    typeof item === 'string' ? item : new RegExp(item.regex.pattern, item.regex.flags),
  )
}

function createMatcher(patterns: (string | RegExp)[]) {
  return (str: string) => {
    return patterns.some((pattern) => {
      if (typeof pattern === 'string') {
        return pattern === str
      }

      return pattern.test(str)
    })
  }
}

export const name = 'no-unlocalized-strings'
export const rule = createRule<Option[], string>({
  name,
  meta: {
    docs: {
      description:
        'Ensures all strings, templates, and JSX text are properly wrapped with `<Trans>`, `t`, or `msg` for translation.',
      recommended: 'error',
    },
    messages: {
      default: 'String not marked for translation. Wrap it with t``, <Trans>, or msg``.',
      forJsxText: 'String not marked for translation. Wrap it with <Trans>.',
      forAttribute:
        'Attribute not marked for translation. \n Wrap it with t`` from useLingui() macro hook.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignoreFunction: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignoreMethodsOnTypes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignoreAttribute: {
            type: 'array',
            items: MatcherSchema,
          },
          strictAttribute: {
            type: 'array',
            items: MatcherSchema,
          },
          ignoreProperty: {
            type: 'array',
            items: MatcherSchema,
          },
          useTsTypes: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context) {
    // variables should be defined here
    const {
      options: [option],
    } = context

    let tsService: ParserServicesWithTypeInformation
    if (option?.useTsTypes) {
      tsService = ESLintUtils.getParserServices(context, false)
    }
    const whitelists = [
      /^[^A-Za-z]+$/, // ignore not-word string
      ...((option && option.ignore) || []),
    ].map((item) => new RegExp(item))

    const calleeWhitelists = generateCalleeWhitelists(option)
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    function isStrMatched(str: string) {
      const mainAcceptanceRegex = /((^[A-Z]{1}.*?)|(\w*?\s\w*?.*?))/
      const lettersRegex = /[a-z]/

      return str && mainAcceptanceRegex.test(str) && lettersRegex.test(str)
    }

    function match(str: string) {
      return whitelists.some((item) => item.test(str))
    }

    function isValidFunctionCall({
      callee,
    }: TSESTree.CallExpression | TSESTree.NewExpression): boolean {
      switch (callee.type) {
        case TSESTree.AST_NODE_TYPES.MemberExpression: {
          if (isIdentifier(callee.property) && isIdentifier(callee.object)) {
            if (calleeWhitelists.simple.includes(callee.property.name)) {
              return true
            }

            const calleeName = `${callee.object.name}.${callee.property.name}`

            if (calleeWhitelists.complex.includes(calleeName)) {
              return true
            }
          }

          // use power of TS compiler to exclude call on specific types, such Map.get, Set.get and so on
          if (tsService && isIdentifier(callee.property)) {
            for (const ignore of ignoredMethodsOnTypes) {
              const [type, method] = ignore.split('.')

              if (method === callee.property.name) {
                const typeObj = tsService.getTypeAtLocation(callee.object)

                if (type === typeObj?.getSymbol()?.name) {
                  return true
                }
              }
            }
          }

          return false
        }
        case TSESTree.AST_NODE_TYPES.Identifier: {
          return calleeWhitelists.simple.includes(callee.name)
        }
        case TSESTree.AST_NODE_TYPES.CallExpression: {
          return (
            (isMemberExpression(callee.callee) || isIdentifier(callee.callee)) &&
            isValidFunctionCall(callee)
          )
        }
        default:
          return false
      }
    }

    const ignoredJSXElements = ['Trans']
    const ignoredJSXSymbols = ['&larr;', '&nbsp;', '&middot;']

    const strictAttributes = [...preparePatterns(option?.strictAttribute || [])]

    const ignoredAttributes = [
      'className',
      'styleName',
      'type',
      'id',
      'width',
      'height',

      ...preparePatterns(option?.ignoreAttribute || []),
    ]

    const ignoredMethodsOnTypes = [
      'Map.get',
      'Map.has',
      'Set.has',
      ...(option?.ignoreMethodsOnTypes || []),
    ]

    const ignoredProperties = [
      'className',
      'styleName',
      'type',
      'id',
      'width',
      'height',
      'displayName',
      UpperCaseRegexp,
      ...preparePatterns(option?.ignoreProperty || []),
    ]

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    const visited = new WeakSet()

    function isIgnoredSymbol(str: string) {
      return ignoredJSXSymbols.some((name) => name === str)
    }

    const isIgnoredAttribute = createMatcher(ignoredAttributes)
    const isIgnoredProperty = createMatcher(ignoredProperties)
    const isStrictAttribute = createMatcher(strictAttributes)

    function isIgnoredJSXElement(
      node: TSESTree.Literal | TSESTree.TemplateLiteral | TSESTree.JSXText,
    ) {
      return ignoredJSXElements.some((name) => hasAncestorWithName(node, name))
    }

    function isStringLiteral(node: TSESTree.Literal | TSESTree.TemplateLiteral | TSESTree.JSXText) {
      switch (node.type) {
        case TSESTree.AST_NODE_TYPES.Literal:
          return typeof node.value === 'string'
        case TSESTree.AST_NODE_TYPES.TemplateLiteral:
          return Boolean(node.quasis)
        case TSESTree.AST_NODE_TYPES.JSXText:
          return true
        default:
          return false
      }
    }

    const getAttrName = (node: TSESTree.JSXIdentifier | string) => {
      if (typeof node === 'string') {
        return node
      }
      return node?.name
    }

    const processTextNode = (
      node: TSESTree.Literal | TSESTree.TemplateLiteral | TSESTree.JSXText,
    ) => {
      visited.add(node)

      const text = getText(node)
      if (!text || match(text) || isIgnoredJSXElement(node) || isIgnoredSymbol(text)) {
        return
      }

      if (node.type === TSESTree.AST_NODE_TYPES.JSXText) {
        context.report({ node, messageId: 'forJsxText' })
        return
      }

      context.report({ node, messageId: 'default' })
    }

    const visitor: {
      [key: string]: (node: any) => void
    } = {
      'ImportDeclaration Literal'(node: TSESTree.Literal) {
        // allow (import abc form 'abc')
        visited.add(node)
      },

      'ExportAllDeclaration Literal'(node: TSESTree.Literal) {
        // allow export * from 'mod'
        visited.add(node)
      },

      'ExportNamedDeclaration > Literal'(node: TSESTree.Literal) {
        // allow export { named } from 'mod'
        visited.add(node)
      },

      JSXText(node: TSESTree.JSXText) {
        processTextNode(node)
      },

      'JSXElement > Literal'(node: TSESTree.Literal) {
        processTextNode(node)
      },

      'JSXElement > JSXExpressionContainer > Literal'(node: TSESTree.Literal) {
        processTextNode(node)
      },

      'JSXElement > JSXExpressionContainer > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        processTextNode(node)
      },

      'JSXAttribute :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        const parent = getNearestAncestor<TSESTree.JSXAttribute>(
          node,
          TSESTree.AST_NODE_TYPES.JSXAttribute,
        )
        const attrName = getAttrName(parent?.name?.name)

        if (isStrictAttribute(attrName)) {
          visited.add(node)
          context.report({ node, messageId: 'default' })
          return
        }

        // allow <MyComponent className="active" />
        if (isIgnoredAttribute(attrName)) {
          visited.add(node)
          return
        }

        const jsxElement = getNearestAncestor<TSESTree.JSXOpeningElement>(
          node,
          TSESTree.AST_NODE_TYPES.JSXOpeningElement,
        )
        const tagName = getIdentifierName(jsxElement?.name)
        const attributeNames = jsxElement?.attributes.map(
          (attr) => isJSXAttribute(attr) && getAttrName(attr.name.name),
        )
        if (isAllowedDOMAttr(tagName, attrName, attributeNames)) {
          visited.add(node)
          return
        }
      },

      'TSLiteralType Literal'(node: TSESTree.Literal) {
        // allow var a: Type['member'];
        visited.add(node)
      },
      // ─────────────────────────────────────────────────────────────────
      'ClassProperty > :matches(Literal,TemplateLiteral), PropertyDefinition > :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal,
      ) {
        const { parent } = node
        if (
          (parent.type === TSESTree.AST_NODE_TYPES.Property ||
            parent.type === TSESTree.AST_NODE_TYPES.PropertyDefinition ||
            //@ts-ignore
            parent.type === 'ClassProperty') &&
          isIdentifier(parent.key) &&
          isIgnoredProperty(parent.key.name)
        ) {
          visited.add(node)
        }
      },

      'TSEnumMember > :matches(Literal,TemplateLiteral)'(node: TSESTree.Literal) {
        visited.add(node)
      },

      'VariableDeclarator > :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        const parent = node.parent as TSESTree.VariableDeclarator

        // allow statements like const A_B = "test"
        if (isIdentifier(parent.id) && isUpperCase(parent.id.name)) {
          visited.add(node)
        }
      },
      'Property > :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        const parent = node.parent as TSESTree.Property

        // {A_B: "hello world"};
        //  ^^^^
        if (isIdentifier(parent.key) && isIgnoredProperty(parent.key.name)) {
          visited.add(node)
        }

        // {["A_B"]: "hello world"};
        //   ^^^^
        if (
          (isLiteral(parent.key) || isTemplateLiteral(parent.key)) &&
          isIgnoredProperty(getText(parent.key))
        ) {
          visited.add(node)
        }
      },
      'MemberExpression[computed=true] > :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        // obj["key with space"]
        visited.add(node)
      },
      "AssignmentExpression[left.type='MemberExpression'] > Literal"(node: TSESTree.Literal) {
        // options: { ignoreProperties: ['myProperty'] }
        // MyComponent.myProperty = "Hello"
        const assignmentExp = node.parent as TSESTree.AssignmentExpression
        const memberExp = assignmentExp.left as TSESTree.MemberExpression
        if (
          !memberExp.computed &&
          isIdentifier(memberExp.property) &&
          isIgnoredProperty(memberExp.property.name)
        ) {
          visited.add(node)
        }
      },
      'BinaryExpression > :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        if (node.parent.type === TSESTree.AST_NODE_TYPES.BinaryExpression) {
          const {
            parent: { operator },
          } = node

          // allow name === 'String'
          if (operator !== '+') {
            visited.add(node)
          }
        }
      },

      'CallExpression :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        const parent = getNearestAncestor<TSESTree.CallExpression>(
          node,
          TSESTree.AST_NODE_TYPES.CallExpression,
        )

        if (isValidFunctionCall(parent)) {
          visited.add(node)
          return
        }
      },

      'NewExpression :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        const parent = getNearestAncestor<TSESTree.NewExpression>(
          node,
          TSESTree.AST_NODE_TYPES.NewExpression,
        )

        if (isValidFunctionCall(parent)) {
          visited.add(node)
          return
        }
      },

      'SwitchCase > :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        visited.add(node)
      },

      'TaggedTemplateExpression > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        visited.add(node)
      },

      'TaggedTemplateExpression > TemplateLiteral :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal,
      ) {
        visited.add(node)
      },

      'Literal:exit'(node: TSESTree.Literal) {
        // visited and passed linting
        if (visited.has(node)) return
        const trimed = `${node.value}`.trim()
        if (!trimed) return

        // allow statements like const a = "FOO"
        if (isUpperCase(trimed)) return

        if (match(trimed) || !isStrMatched(trimed)) return

        //
        // TYPESCRIPT
        //
        if (tsService) {
          const typeObj = tsService.getTypeAtLocation(node.parent)

          // var a: 'abc' = 'abc'
          if (typeObj.isStringLiteral() && typeObj.symbol) {
            return
          }
        }

        context.report({ node, messageId: 'default' })
      },
      'TemplateLiteral:exit'(node: TSESTree.TemplateLiteral) {
        if (visited.has(node)) return
        const quasisValue = getText(node)
        if (isUpperCase(quasisValue)) return

        if (match(quasisValue) || !isStrMatched(quasisValue)) return

        context.report({ node, messageId: 'default' })
      },
    }

    function wrapVisitor<
      Type extends TSESTree.Literal | TSESTree.TemplateLiteral | TSESTree.JSXText,
    >(visitor: { [key: string]: (node: Type) => void }) {
      const newVisitor: {
        [key: string]: (node: Type) => void
      } = {}
      Object.keys(visitor).forEach((key) => {
        const old: (node: Type) => void = visitor[key]

        newVisitor[key] = (node: Type) => {
          // make sure node is string literal
          if (!isStringLiteral(node)) return

          old(node)
        }
      })
      return newVisitor
    }

    return wrapVisitor<TSESTree.Literal>(visitor)
  },
})

const popularCallee = [
  'addEventListener',
  'removeEventListener',
  'postMessage',
  'getElementById',
  'dispatch',
  'commit',
  'includes',
  'indexOf',
  'endsWith',
  'startsWith',
  'require',
]
function generateCalleeWhitelists(option: Option) {
  const result = {
    simple: ['t', 'plural', 'select', ...popularCallee],
    complex: ['i18n._'],
  }

  ;(option?.ignoreFunction || []).forEach((item) => {
    if (item.includes('.')) {
      result.complex.push(item)
    } else {
      result.simple.push(item)
    }
  })

  return result
}
