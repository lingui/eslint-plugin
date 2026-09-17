import { createRule } from '../create-rule'
import { collectLinguiDirectives, DirectiveValues } from '../directives'

export const name = 'require-directive-reset'

type MessageIds = 'missingReset' | 'redundantReset'

function hasValues(values: DirectiveValues | undefined): boolean {
  return values != null && Object.keys(values).length > 0
}

export const rule = createRule<[], MessageIds>({
  name,
  meta: {
    docs: {
      description: "enforce closing Lingui context directives with '// lingui-reset'",
      recommended: 'error',
    },
    messages: {
      missingReset:
        "'{{ directive }}' applies until the end of the file. Add a '// lingui-reset' comment to scope it to the messages it describes",
      redundantReset: "'lingui-reset' has no effect here because no directive is in effect",
    },
    schema: [],
    type: 'problem' as const,
  },

  defaultOptions: [],

  create: function (context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    return {
      Program() {
        const directives = collectLinguiDirectives(sourceCode.getAllComments())
        if (!directives.length) return

        // A reset is redundant when nothing is in effect for it to drop and it declares
        // no values of its own.
        directives.forEach((directive, index) => {
          if (!directive.reset) return
          if (hasValues(directive.values) || hasValues(directives[index - 1]?.values)) return

          context.report({ loc: directive.comment.loc, messageId: 'redundantReset' })
        })

        // Directives accumulate, so only the last one can still be in effect at this point.
        const last = directives[directives.length - 1]
        if (!hasValues(last.values)) return

        context.report({
          loc: last.comment.loc,
          messageId: 'missingReset',
          data: { directive: last.reset ? 'lingui-reset' : 'lingui-set' },
        })
      },
    }
  },
})
