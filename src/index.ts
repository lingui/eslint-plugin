import i18nOnlyIdentifiersRule from './rules/i18n-only-identifiers'
import missingLinguiTransformationRule from './rules/missing-lingui-transformation'
import noSingleTagToTranslateRule from './rules/no-single-tag-to-translate'
import noSingleVariablesToTranslateRule from './rules/no-single-variables-to-translate'
import tCallInFunctionRule from './rules/t-call-in-function'
import textRestrictionsRule from './rules/text-restrictions'
import noTransInsideTransRule from './rules/no-trans-inside-trans'

export const rules = {
  'i18n-only-identifiers': i18nOnlyIdentifiersRule,
  'missing-lingui-transformation': missingLinguiTransformationRule,
  'no-single-tag-to-translate': noSingleTagToTranslateRule,
  'no-single-variables-to-translate': noSingleVariablesToTranslateRule,
  't-call-in-function': tCallInFunctionRule,
  'text-restrictions': textRestrictionsRule,
  'no-trans-inside-trans': noTransInsideTransRule,
}
