import { ESLintUtils } from '@typescript-eslint/utils'

export type ExtraRuleDocs = {
  recommended: 'strict' | 'error' | 'warn'
}

export const createRule = ESLintUtils.RuleCreator<ExtraRuleDocs>(
  (name) => `https://github.com/lingui/eslint-plugin?tab=readme-ov-file#${name}`,
)
