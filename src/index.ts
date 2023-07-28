import i18nOnlyIdentifiersRule from './rules/i18n-only-identifiers'
import missingLinguiTransformationRule from './rules/missing-lingui-transformation'
import noSingleTagToTranslateRule from './rules/no-single-tag-to-translate'
import noSingleVariblesToTranslateRule from './rules/no-single-varibles-to-translate'
import tCallInFunctionRule from './rules/t-call-in-function'
import textRestrictionsRule from './rules/text-restrictions'
import noTransInsideTransRule from './rules/no-trans-inside-trans'

export const rules = {
  'i18n-only-identifiers': i18nOnlyIdentifiersRule,
  'missing-lingui-transformation': missingLinguiTransformationRule,
  'no-single-tag-to-translate': noSingleTagToTranslateRule,
  'no-single-varibles-to-translate': noSingleVariblesToTranslateRule,
  't-call-in-function': tCallInFunctionRule,
  'text-restrictions': textRestrictionsRule,
  'no-trans-inside-trans': noTransInsideTransRule,
}
