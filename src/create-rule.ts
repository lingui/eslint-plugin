import { ESLintUtils } from '@typescript-eslint/utils'

export type ExtraRuleDocs = {
  recommended: 'strict' | 'error' | 'warn'
}

export const createRule = ESLintUtils.RuleCreator<ExtraRuleDocs>(
  (name) => `https://github.com/lingui/eslint-plugin/blob/main/docs/rules/${name}.md`,
)
