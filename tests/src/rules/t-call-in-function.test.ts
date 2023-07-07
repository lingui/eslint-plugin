import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../src/rules/t-call-in-function.ts'),
  RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const message = 't`` call should be inside function'
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
ruleTester.run('t-call-in-function', rule, {
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
