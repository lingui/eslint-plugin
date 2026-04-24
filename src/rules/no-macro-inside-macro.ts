import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../create-rule'

export const name = 'no-macro-inside-macro'

// Eager message macros produce a translated string at the call site.
// Never safe to nest — the string can't be recomposed into another message.
const EAGER_MESSAGE_MACRO_NAMES = new Set(['t'])

// Lazy message macros produce a MessageDescriptor value.
// Safe as a value passed to t() or interpolated into another message, but never safe
// where a plain string is required (choice branches / option values).
const LAZY_MESSAGE_MACRO_NAMES = new Set(['msg', 'defineMessage'])

const ALL_MESSAGE_MACRO_NAMES = new Set<string>([
  ...EAGER_MESSAGE_MACRO_NAMES,
  ...LAZY_MESSAGE_MACRO_NAMES,
])

// JSX macro components each extract as their own standalone message unit —
// never safe to nest inside another macro.
const JSX_MACRO_COMPONENT_NAMES = new Set(['Trans', 'Plural', 'Select', 'SelectOrdinal'])

const CHOICE_CALL_NAMES = new Set(['plural', 'select', 'selectOrdinal'])
const CHOICE_COMPONENT_NAMES = new Set(['Plural', 'Select', 'SelectOrdinal'])

// Attributes / option keys on choice macros that are not branch values and may
// legitimately hold any expression.
const CHOICE_RESERVED_KEYS = new Set(['value', 'offset'])

type InnerMacro =
  | { kind: 'eager'; name: string }
  | { kind: 'lazy'; name: string }
  | { kind: 'component'; name: string }

type BadContainer =
  | { kind: 'messageMacro'; outer: string }
  | { kind: 'choiceComponentBranch'; component: string; attr: string }
  | { kind: 'choiceCallOption'; call: string; option: string }

function getInnerMacro(node: TSESTree.Node): InnerMacro | null {
  if (node.type === TSESTree.AST_NODE_TYPES.TaggedTemplateExpression) {
    if (node.tag.type !== TSESTree.AST_NODE_TYPES.Identifier) return null
    const name = node.tag.name
    if (EAGER_MESSAGE_MACRO_NAMES.has(name)) return { kind: 'eager', name }
    if (LAZY_MESSAGE_MACRO_NAMES.has(name)) return { kind: 'lazy', name }
    return null
  }
  if (node.type === TSESTree.AST_NODE_TYPES.CallExpression) {
    if (node.callee.type !== TSESTree.AST_NODE_TYPES.Identifier) return null
    const name = node.callee.name
    if (EAGER_MESSAGE_MACRO_NAMES.has(name)) return { kind: 'eager', name }
    if (LAZY_MESSAGE_MACRO_NAMES.has(name)) return { kind: 'lazy', name }
    return null
  }
  if (node.type === TSESTree.AST_NODE_TYPES.JSXElement) {
    const tag = node.openingElement.name
    if (tag.type !== TSESTree.AST_NODE_TYPES.JSXIdentifier) return null
    if (JSX_MACRO_COMPONENT_NAMES.has(tag.name)) return { kind: 'component', name: tag.name }
    return null
  }
  return null
}

function isMessageMacroNode(node: TSESTree.Node): string | null {
  if (
    node.type === TSESTree.AST_NODE_TYPES.TaggedTemplateExpression &&
    node.tag.type === TSESTree.AST_NODE_TYPES.Identifier &&
    ALL_MESSAGE_MACRO_NAMES.has(node.tag.name)
  ) {
    return node.tag.name
  }
  if (
    node.type === TSESTree.AST_NODE_TYPES.CallExpression &&
    node.callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
    ALL_MESSAGE_MACRO_NAMES.has(node.callee.name)
  ) {
    return node.callee.name
  }
  return null
}

function getPropertyKeyName(key: TSESTree.Node): string | null {
  if (key.type === TSESTree.AST_NODE_TYPES.Identifier) return key.name
  if (
    key.type === TSESTree.AST_NODE_TYPES.Literal &&
    (typeof key.value === 'string' || typeof key.value === 'number')
  ) {
    return String(key.value)
  }
  return null
}

// Walk up from `node` to the nearest Lingui container in which the inner macro is illegal.
function findBadContainer(node: TSESTree.Node): BadContainer | null {
  let current: TSESTree.Node | undefined = node.parent
  while (current) {
    const outerMessageMacro = isMessageMacroNode(current)
    if (outerMessageMacro) {
      return { kind: 'messageMacro', outer: outerMessageMacro }
    }

    if (current.type === TSESTree.AST_NODE_TYPES.JSXAttribute) {
      const opening = current.parent
      if (
        opening?.type === TSESTree.AST_NODE_TYPES.JSXOpeningElement &&
        opening.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier &&
        CHOICE_COMPONENT_NAMES.has(opening.name.name) &&
        current.name.type === TSESTree.AST_NODE_TYPES.JSXIdentifier &&
        !CHOICE_RESERVED_KEYS.has(current.name.name)
      ) {
        return {
          kind: 'choiceComponentBranch',
          component: opening.name.name,
          attr: current.name.name,
        }
      }
    }

    if (current.type === TSESTree.AST_NODE_TYPES.Property) {
      const obj = current.parent
      const call = obj?.parent
      if (
        obj?.type === TSESTree.AST_NODE_TYPES.ObjectExpression &&
        call?.type === TSESTree.AST_NODE_TYPES.CallExpression &&
        call.callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
        CHOICE_CALL_NAMES.has(call.callee.name) &&
        call.arguments[1] === obj
      ) {
        const keyName = getPropertyKeyName(current.key)
        if (keyName && !CHOICE_RESERVED_KEYS.has(keyName)) {
          return {
            kind: 'choiceCallOption',
            call: call.callee.name,
            option: keyName,
          }
        }
      }
    }

    current = current.parent
  }
  return null
}

// The canonical descriptor-passthrough pattern: `t(msg`...`)` / `t(defineMessage(...))`.
// A lazy message macro is valid *only* as a direct call argument to another message macro call;
// anywhere else it's interpolated/stringified as `[object Object]` at runtime.
function isLazyPassthrough(node: TSESTree.Node, inner: InnerMacro): boolean {
  if (inner.kind !== 'lazy') return false
  const parent = node.parent
  if (parent?.type !== TSESTree.AST_NODE_TYPES.CallExpression) return false
  if (!parent.arguments.includes(node as TSESTree.CallExpressionArgument)) return false
  return isMessageMacroNode(parent) !== null
}

export const rule = createRule({
  name,
  meta: {
    docs: {
      description:
        'Disallow nesting Lingui translation macros. Message macros (t, msg, defineMessage) and component macros (Trans, Plural, Select, SelectOrdinal) each extract as a standalone translation unit and cannot be composed through another macro.',
      recommended: 'error',
    },
    messages: {
      insideMessageMacro:
        'Do not nest `{{inner}}` inside `{{outer}}`. Translation macros each extract as a standalone unit — use plain text or a variable interpolation instead.',
      insideChoiceComponentBranch:
        'Do not use `{{inner}}` inside the `{{attr}}` branch of `<{{component}}>`. The branch is already the extracted string — use a plain string literal.',
      insideChoiceCallOption:
        'Do not use `{{inner}}` inside the `{{option}}` option of `{{call}}()`. The option is already the extracted string — use a plain string literal.',
    },
    schema: [],
    type: 'problem' as const,
  },

  defaultOptions: [],
  create(context) {
    function check(node: TSESTree.Node) {
      const inner = getInnerMacro(node)
      if (!inner) return
      if (isLazyPassthrough(node, inner)) return
      const container = findBadContainer(node)
      if (!container) return

      switch (container.kind) {
        case 'messageMacro':
          context.report({
            node,
            messageId: 'insideMessageMacro',
            data: { inner: inner.name, outer: container.outer },
          })
          return
        case 'choiceComponentBranch':
          context.report({
            node,
            messageId: 'insideChoiceComponentBranch',
            data: { inner: inner.name, component: container.component, attr: container.attr },
          })
          return
        case 'choiceCallOption':
          context.report({
            node,
            messageId: 'insideChoiceCallOption',
            data: { inner: inner.name, call: container.call, option: container.option },
          })
          return
      }
    }

    return {
      ':matches(TaggedTemplateExpression[tag.name=t], TaggedTemplateExpression[tag.name=msg], TaggedTemplateExpression[tag.name=defineMessage])'(
        node: TSESTree.TaggedTemplateExpression,
      ) {
        check(node)
      },
      ':matches(CallExpression[callee.name=t], CallExpression[callee.name=msg], CallExpression[callee.name=defineMessage])'(
        node: TSESTree.CallExpression,
      ) {
        check(node)
      },
      ':matches(JSXElement[openingElement.name.name=Trans], JSXElement[openingElement.name.name=Plural], JSXElement[openingElement.name.name=Select], JSXElement[openingElement.name.name=SelectOrdinal])'(
        node: TSESTree.JSXElement,
      ) {
        check(node)
      },
    }
  },
})
