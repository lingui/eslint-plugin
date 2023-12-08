import { TSESTree } from '@typescript-eslint/utils'
import {
  RuleContext,
  RuleRecommendation,
  RuleModule,
} from '@typescript-eslint/utils/dist/ts-eslint/Rule'
import type * as ts from 'typescript'
import {
  isUpperCase,
  isAllowedDOMAttr,
  getNearestAncestor,
  getQuasisValue,
  hasAncestorWithName,
  getIdentifierName,
} from '../helpers'

export type Option = {
  ignore?: string[]
  ignoreFunction?: string[]
  ignoreAttribute?: string[]
  ignoreProperty?: string[]
}
const rule: RuleModule<string, Option[]> = {
  meta: {
    docs: {
      description: 'disallow literal string',
      recommended: 'error' as RuleRecommendation,
    },
    messages: {
      default: '{{ message }}',
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
          ignoreAttribute: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          ignoreProperty: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context: RuleContext<string, Option[]>) {
    // variables should be defined here
    const {
      parserServices,
      options: [option],
    } = context
    const whitelists = [
      /^[^A-Za-z]+$/, // ignore not-word string
      ...((option && option.ignore) || []),
    ].map((item) => new RegExp(item))

    const calleeWhitelists = generateCalleeWhitelists(option)
    const message = 'disallow literal string'
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

    function isValidFunctionCall({ callee }: TSESTree.CallExpression | TSESTree.NewExpression) {
      switch (callee.type) {
        case TSESTree.AST_NODE_TYPES.MemberExpression: {
          if (
            callee.property.type === TSESTree.AST_NODE_TYPES.Identifier &&
            callee.object.type === TSESTree.AST_NODE_TYPES.Identifier
          ) {
            if (calleeWhitelists.simple.indexOf(callee.property.name) !== -1) {
              return true
            }

            const calleeName = `${callee.object.name}.${callee.property.name}`
            return calleeWhitelists.complex.indexOf(calleeName) !== -1
          }
          return false
        }
        case TSESTree.AST_NODE_TYPES.Identifier: {
          if (callee.name === 'require') {
            return true
          }
          return calleeWhitelists.simple.indexOf(callee.name) !== -1
        }
        default:
          return false
      }
    }

    const ignoredClassProperties = ['displayName']
    const ignoredJSXElements = ['Trans']
    const ignoredJSXSymbols = ['&larr;', '&nbsp;', '&middot;']

    const ignoredAttributes = (option && option.ignoreAttribute) || []
    const userJSXAttrs = [
      'className',
      'styleName',
      'type',
      'id',
      'width',
      'height',

      ...ignoredAttributes,
    ]

    const ignoredProperties = (option && option.ignoreProperty) || []
    const userProperties = [
      'className',
      'styleName',
      'type',
      'id',
      'width',
      'height',

      ...ignoredProperties,
    ]

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    const visited = new WeakSet()

    function isString(node: TSESTree.Literal | TSESTree.TemplateLiteral | TSESTree.JSXText) {
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

    const { esTreeNodeToTSNodeMap, program } = parserServices
    let typeChecker: ts.TypeChecker
    if (program && esTreeNodeToTSNodeMap) {
      typeChecker = program.getTypeChecker()
    }

    const getAttrName = (node: TSESTree.JSXIdentifier | string) => {
      if (typeof node === 'string') {
        return node
      }
      return node?.name
    }

    const onJSXAttribute = (
      node: TSESTree.TemplateLiteral | TSESTree.Literal | TSESTree.MemberExpression,
    ) => {
      const parent = getNearestAncestor<TSESTree.JSXAttribute>(node, 'JSXAttribute')
      const attrName = getAttrName(parent?.name?.name)
      // allow <MyComponent className="active" />
      if (userJSXAttrs.includes(getAttrName(parent?.name?.name))) {
        visited.add(node)
        return
      }

      const jsxElement = getNearestAncestor<TSESTree.JSXOpeningElement>(node, 'JSXOpeningElement')
      const tagName = getIdentifierName(jsxElement?.name)
      const attributeNames = jsxElement?.attributes.map(
        (attr: TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute) =>
          attr.type === TSESTree.AST_NODE_TYPES.JSXAttribute && getAttrName(attr?.name?.name),
      )
      if (isAllowedDOMAttr(tagName, attrName, attributeNames)) {
        visited.add(node)
      }
    }

    const onProperty = (node: TSESTree.Literal | TSESTree.TemplateLiteral) => {
      const { parent } = node

      if (parent.type === TSESTree.AST_NODE_TYPES.Property) {
        // if node is key of property, skip
        if (parent?.key === node) {
          visited.add(node)
        }

        // name if key is Identifier; value if key is Literal
        // dont care whether if this is computed or not
        if (
          parent?.key?.type === TSESTree.AST_NODE_TYPES.Identifier &&
          (isUpperCase(parent?.key?.name) || userProperties.includes(parent?.key?.name))
        ) {
          visited.add(node)
        }

        if (
          parent?.key?.type === TSESTree.AST_NODE_TYPES.Literal &&
          isUpperCase(`${parent?.key?.value}`)
        ) {
          visited.add(node)
        }

        if (
          parent?.value?.type === TSESTree.AST_NODE_TYPES.Literal &&
          isUpperCase(`${parent?.value?.value}`)
        ) {
          visited.add(node)
        }

        if (
          parent?.key?.type === TSESTree.AST_NODE_TYPES.TemplateLiteral &&
          isUpperCase(getQuasisValue(parent?.key))
        ) {
          visited.add(node)
        }
      }
    }

    const onBinaryExpression = (node: TSESTree.Literal | TSESTree.TemplateLiteral) => {
      if (node.parent.type === TSESTree.AST_NODE_TYPES.BinaryExpression) {
        const {
          parent: { operator },
        } = node

        // allow name === 'String'
        if (operator !== '+') {
          visited.add(node)
        }
      }
    }

    const onCallExpression = (
      node: TSESTree.Literal | TSESTree.TemplateLiteral,
      parentName: TSESTree.AST_NODE_TYPES.CallExpression | TSESTree.AST_NODE_TYPES.NewExpression,
    ) => {
      const parent =
        TSESTree.AST_NODE_TYPES.CallExpression === parentName
          ? getNearestAncestor<TSESTree.CallExpression>(node, parentName)
          : getNearestAncestor<TSESTree.NewExpression>(node, parentName)

      if (isValidFunctionCall(parent)) visited.add(node)
    }

    const onClassProperty = (node: TSESTree.Literal | TSESTree.TemplateLiteral) => {
      const { parent } = node
      if (
        (parent.type === TSESTree.AST_NODE_TYPES.Property ||
          parent.type === TSESTree.AST_NODE_TYPES.PropertyDefinition ||
          //@ts-ignore
          parent.type === 'ClassProperty') &&
        parent.key.type === TSESTree.AST_NODE_TYPES.Identifier
      ) {
        if (parent?.key && ignoredClassProperties.includes(parent.key.name)) {
          visited.add(node)
        }
      }
    }

    const processTextNode = (
      node: TSESTree.Literal | TSESTree.TemplateLiteral | TSESTree.JSXText,
      text: string,
    ) => {
      visited.add(node)

      const userJSXElement = [...ignoredJSXElements]

      function isUserJSXElement(
        node: TSESTree.Literal | TSESTree.TemplateLiteral | TSESTree.JSXText,
      ) {
        return userJSXElement.some((name) => hasAncestorWithName(node, name))
      }

      function isIgnoredSymbol(str: string) {
        return ignoredJSXSymbols.some((name) => name === str)
      }

      if (!text || match(text) || isUserJSXElement(node) || isIgnoredSymbol(text)) {
        return
      }

      context.report({ node, messageId: 'default', data: { message } })
    }

    const literalVisitor: {
      [key: string]: (node: TSESTree.Literal) => void
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

      'JSXElement > Literal'(node: TSESTree.Literal) {
        processTextNode(node, `${node.value}`.trim())
      },

      'JSXElement > JSXExpressionContainer > Literal'(node: TSESTree.Literal) {
        processTextNode(node, `${node.value}`.trim())
      },

      'JSXAttribute Literal'(node: TSESTree.Literal) {
        onJSXAttribute(node)
      },

      'TSLiteralType Literal'(node: TSESTree.Literal) {
        // allow var a: Type['member'];
        visited.add(node)
      },
      // ─────────────────────────────────────────────────────────────────

      'ClassProperty > Literal'(node: TSESTree.Literal) {
        onClassProperty(node)
      },

      'TSEnumMember > Literal'(node: TSESTree.Literal) {
        visited.add(node)
      },

      'VariableDeclarator > Literal'(node: TSESTree.Literal) {
        // allow statements like const A_B = "test"
        if (
          node.parent.type === TSESTree.AST_NODE_TYPES.VariableDeclarator &&
          node.parent.id.type === TSESTree.AST_NODE_TYPES.Identifier &&
          isUpperCase(node.parent.id.name)
        ) {
          visited.add(node)
        }
      },
      'Property > Literal'(node: TSESTree.Literal) {
        onProperty(node)
      },
      'BinaryExpression > Literal'(node: TSESTree.Literal) {
        onBinaryExpression(node)
      },

      'CallExpression Literal'(node: TSESTree.Literal) {
        onCallExpression(node, TSESTree.AST_NODE_TYPES.CallExpression)
      },

      'NewExpression Literal'(node: TSESTree.Literal) {
        onCallExpression(node, TSESTree.AST_NODE_TYPES.NewExpression)
      },

      'SwitchCase > Literal'(node: TSESTree.Literal) {
        visited.add(node)
      },

      'TaggedTemplateExpression > TemplateLiteral Literal'(node: TSESTree.Literal) {
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

        if (typeChecker) {
          const tsNode = esTreeNodeToTSNodeMap.get(node)
          const typeObj = typeChecker.getTypeAtLocation(tsNode.parent)

          // var a: 'abc' = 'abc'
          if (typeObj.isStringLiteral() && typeObj.symbol) {
            return
          }
        }
        context.report({ node, messageId: 'default', data: { message } })
      },
    }

    const templateLiteralVisitor: {
      [key: string]: (node: TSESTree.TemplateLiteral) => void
    } = {
      'JSXElement > JSXExpressionContainer > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        processTextNode(node, getQuasisValue(node))
      },
      'JSXAttribute TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        onJSXAttribute(node)
      },
      'ClassProperty > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        onClassProperty(node)
      },
      'TSEnumMember > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        visited.add(node)
      },
      'VariableDeclarator > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        // allow statements like const A_B = `test`
        if (
          node.parent.type === TSESTree.AST_NODE_TYPES.VariableDeclarator &&
          node.parent.id.type === TSESTree.AST_NODE_TYPES.Identifier &&
          isUpperCase(node.parent.id.name)
        ) {
          visited.add(node)
        }
      },
      'Property > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        onProperty(node)
      },

      'BinaryExpression > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        onBinaryExpression(node)
      },

      'CallExpression TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        onCallExpression(node, TSESTree.AST_NODE_TYPES.CallExpression)
      },

      'NewExpression TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        onCallExpression(node, TSESTree.AST_NODE_TYPES.NewExpression)
      },

      'SwitchCase > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        visited.add(node)
      },

      'TaggedTemplateExpression > TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        visited.add(node)
      },

      'TaggedTemplateExpression > TemplateLiteral TemplateLiteral'(node: TSESTree.TemplateLiteral) {
        visited.add(node)
      },
      'TemplateLiteral:exit'(node: TSESTree.TemplateLiteral) {
        if (visited.has(node)) return
        const quasisValue = getQuasisValue(node)
        if (isUpperCase(quasisValue)) return

        if (match(quasisValue) || !isStrMatched(quasisValue)) return

        context.report({ node, messageId: 'default', data: { message } })
      },
    }

    const jsxTextLiteralVisitor: {
      [key: string]: (node: TSESTree.JSXText) => void
    } = {
      JSXText(node: TSESTree.JSXText) {
        processTextNode(node, `${node.value}`.trim())
      },
    }

    function wrapVisitor<
      Type extends TSESTree.Literal | TSESTree.TemplateLiteral | TSESTree.JSXText
    >(visitor: { [key: string]: (node: Type) => void }) {
      const newVisitor: {
        [key: string]: (node: Type) => void
      } = {}
      Object.keys(visitor).forEach((key) => {
        const old: (node: Type) => void = visitor[key]

        newVisitor[key] = (node: Type) => {
          // make sure node is string literal
          if (!isString(node)) return

          old(node)
        }
      })
      return newVisitor
    }

    return {
      ...wrapVisitor<TSESTree.Literal>(literalVisitor),
      ...wrapVisitor<TSESTree.TemplateLiteral>(templateLiteralVisitor),
      ...wrapVisitor<TSESTree.JSXText>(jsxTextLiteralVisitor),
    }
  },
}

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
]
function generateCalleeWhitelists(option: Option) {
  const ignoreFunction = (option && option.ignoreFunction) || []
  const result = {
    simple: ['t', 'plural', 'select', ...popularCallee],
    complex: ['i18n._'],
  }
  ignoreFunction.forEach((item: string) => {
    if (item.indexOf('.') !== -1) {
      result.complex.push(item)
    } else {
      result.simple.push(item)
    }
  })
  return result
}

export default rule
