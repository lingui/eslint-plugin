import noExpressionInMessageRule from './rules/no-expression-in-message'
import noUnlocalizedStringsRule from './rules/no-unlocalized-strings'
import noSingleTagToTranslateRule from './rules/no-single-tag-to-translate'
import noSingleVariablesToTranslateRule from './rules/no-single-variables-to-translate'
import tCallInFunctionRule from './rules/t-call-in-function'
import textRestrictionsRule from './rules/text-restrictions'
import noTransInsideTransRule from './rules/no-trans-inside-trans'

export const rules = {
  'no-expression-in-message': noExpressionInMessageRule,
  'no-unlocalized-strings': noUnlocalizedStringsRule,
  'no-single-tag-to-translate': noSingleTagToTranslateRule,
  'no-single-variables-to-translate': noSingleVariablesToTranslateRule,
  't-call-in-function': tCallInFunctionRule,
  'text-restrictions': textRestrictionsRule,
  'no-trans-inside-trans': noTransInsideTransRule,
}
