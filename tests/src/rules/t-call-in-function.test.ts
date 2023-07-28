import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'
import rule from '../../../src/rules/t-call-in-function'
import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint/RuleTester'

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const errors = [{ messageId: 'default' }] // default errors

var ruleTester = new RuleTester({
  parser: TYPESCRIPT_ESLINT,
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
})
ruleTester.run<string, readonly unknown[]>('t-call-in-function', rule, {
  valid: [
    {
      code: 'function hello() { return t`Hello`}',
    },

    { code: 'class React{ render(){return t`Hello`}}' },
    { code: 'class React{ static state = t`Hello`}' },
    {
      code: 'const a = () => {t`Hello`}',
    },
    {
      code:
        'const StyledAMLQuestionsContainer = styled(AMLQuestionsContainer)` \
                text-align: center; \
                padding: ${tokens.spacing20};\
              `',
    },
  ],

  invalid: [{ code: 't`Hello`', errors }],
})
