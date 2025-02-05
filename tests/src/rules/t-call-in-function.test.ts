import { rule, name } from '../../../src/rules/t-call-in-function'
import { RuleTester } from '@typescript-eslint/rule-tester'

describe('', () => {})

const ruleTester = new RuleTester()

const errors = [{ messageId: 'default' }] as const

ruleTester.run(name, rule, {
  valid: [
    {
      code: 'function hello() { return t`Hello`}',
    },

    { code: 'class React { render() { return t`Hello` } }' },
    { code: 'class React { render = () => { return t`Hello` } }' },
    { code: 'class React { static state = t`Hello` }' },
    {
      code: 'const a = () => {t`Hello`}',
    },
    {
      code: 'const StyledAMLQuestionsContainer = styled(AMLQuestionsContainer)` \
                text-align: center; \
                padding: ${tokens.spacing20};\
              `',
    },
    {
      code: 'const a = () => {t("Hello")}',
    },
    {
      code: 'msg`Hello`',
    },
    {
      code: 'defineMessage`Hello`',
    },
  ],

  invalid: [
    { code: 'for (const item of items) { t`Hello` }', errors },
    { code: '{ t`Hello` }', errors },
    { code: 'for (const item of items) { t("Hello") }', errors },
    { code: '{ t("Hello") }', errors },
    { code: 't`Hello`', errors },
    { code: 't("Hello")', errors },
    { code: 'const hello = [t({id:"hello", message:"hello"})]', errors },
  ],
})
