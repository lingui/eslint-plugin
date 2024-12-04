import {
  ESLintUtils,
  JSONSchema,
  ParserServicesWithTypeInformation,
  TSESTree,
} from '@typescript-eslint/utils'
import {
  buildCalleePath,
  getIdentifierName,
  getNearestAncestor,
  getText,
  isAllowedDOMAttr,
  isIdentifier,
  isJSXAttribute,
  isLiteral,
  isMemberExpression,
  isTemplateLiteral,
} from '../helpers'
import { createRule } from '../create-rule'
import * as micromatch from 'micromatch'

type MatcherDef = string | { regex: { pattern: string; flags?: string } }

export type Option = {
  ignore?: string[]
  ignoreFunctions?: string[]
  ignoreNames?: MatcherDef[]
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

function createMatcher(patterns: MatcherDef[]) {
  const _patterns = patterns.map((item) =>
    typeof item === 'string' ? item : new RegExp(item.regex.pattern, item.regex.flags),
  )

  return (str: string) => {
    return _patterns.some((pattern) => {
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
          ignoreNames: {
            type: 'array',
            items: MatcherSchema,
          },
          ignoreFunctions: {
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
    const {
      options: [option],
    } = context

    let tsService: ParserServicesWithTypeInformation
    if (option?.useTsTypes) {
      tsService = ESLintUtils.getParserServices(context, false)
    }
    const whitelists = [
      //
      /^[^\p{L}]+$/u, // ignore non word messages
      ...(option?.ignore || []).map((item) => new RegExp(item)),
    ]

    const calleeWhitelists = [
      // lingui callee
      'i18n._',
      't',
      'plural',
      'select',
      'selectOrdinal',
      'msg',
      ...(option?.ignoreFunctions || []),
    ].map((pattern) => micromatch.matcher(pattern))

    const isCalleeWhitelisted = (callee: string) =>
      calleeWhitelists.some((matcher) => matcher(callee))

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    function isTextWhiteListed(str: string) {
      return whitelists.some((item) => item.test(str))
    }

    function isValidFunctionCall({
      callee,
    }: TSESTree.CallExpression | TSESTree.NewExpression): boolean {
      switch (callee.type) {
        case TSESTree.AST_NODE_TYPES.MemberExpression: {
          if (isCalleeWhitelisted(buildCalleePath(callee))) {
            return true
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
          return isCalleeWhitelisted(callee.name)
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

    const ignoredJSXSymbols = ['&larr;', '&nbsp;', '&middot;']

    const ignoredMethodsOnTypes = option?.ignoreMethodsOnTypes || []

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    const visited = new WeakSet()

    function isIgnoredSymbol(str: string) {
      return ignoredJSXSymbols.some((name) => name === str)
    }

    const isIgnoredName = createMatcher(option?.ignoreNames || [])

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
      if (!text || isIgnoredSymbol(text) || isTextWhiteListed(text)) {
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

      [`:matches(${['Trans', 'Plural', 'Select', 'SelectOrdinal'].map((name) => `JSXElement[openingElement.name.name=${name}]`)}) :matches(TemplateLiteral, Literal, JSXText)`](
        node,
      ) {
        visited.add(node)
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

        // allow <MyComponent className="active" />
        if (isIgnoredName(attrName)) {
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
          isIgnoredName(parent.key.name)
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
        if (isIdentifier(parent.id) && isIgnoredName(parent.id.name)) {
          visited.add(node)
        }
      },
      'Property > :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        const parent = node.parent as TSESTree.Property

        // {A_B: "hello world"};
        // ^^^^
        if (isIdentifier(parent.key) && isIgnoredName(parent.key.name)) {
          visited.add(node)
        }

        // {["A_B"]: "hello world"};
        //   ^^^^
        if (
          (isLiteral(parent.key) || isTemplateLiteral(parent.key)) &&
          isIgnoredName(getText(parent.key))
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
          isIgnoredName(memberExp.property.name)
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

      'JSXText:exit'(node: TSESTree.JSXText) {
        if (visited.has(node)) return
        processTextNode(node)
      },
      'Literal:exit'(node: TSESTree.Literal) {
        // visited and passed linting
        if (visited.has(node)) return
        const trimmed = `${node.value}`.trim()
        if (!trimmed) return

        if (isTextWhiteListed(trimmed)) return

        //
        // TYPESCRIPT
        // todo: that doesn't work
        // if (tsService) {
        //   const typeObj = tsService.getTypeAtLocation(node.parent)
        //
        //   // var a: 'abc' = 'abc'
        //   if (typeObj.isStringLiteral() && typeObj.symbol) {
        //     return
        //   }
        // }

        context.report({ node, messageId: 'default' })
      },
      'TemplateLiteral:exit'(node: TSESTree.TemplateLiteral) {
        if (visited.has(node)) return
        const text = getText(node)

        if (!text || isTextWhiteListed(text)) return

        context.report({ node, messageId: 'default' })
      },

      'AssignmentPattern > :matches(Literal,TemplateLiteral)'(
        node: TSESTree.Literal | TSESTree.TemplateLiteral,
      ) {
        const parent = node.parent as TSESTree.AssignmentPattern

        if (isIdentifier(parent.left) && isIgnoredName(parent.left.name)) {
          visited.add(node)
        }
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
