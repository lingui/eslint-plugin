import { rule, name, Option } from '../../../src/rules/no-unlocalized-strings'
import { RuleTester } from '@typescript-eslint/rule-tester'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
    },
  },
})

const defaultError = [{ messageId: 'default' }]
const jsxTextError = [{ messageId: 'forJsxText' }]
const upperCaseRegex = '^[A-Z_-]+$'
const ignoreUpperCaseName = {
  ignoreNames: [
    {
      regex: { pattern: upperCaseRegex },
    },
  ],
}

ruleTester.run(name, rule, {
  valid: [
    // ==================== Basic i18n Usage ====================
    {
      code: 'i18n._(t`Hello ${nice}`)',
      name: 'allows i18n template literals with interpolation',
    },
    {
      code: 't(i18n)({ message: `Hello ${name}` })',
      name: 'allows i18n function with template message',
    },
    {
      code: 'i18n._(`hello`)',
      name: 'allows i18n with template literal',
    },
    {
      code: 'i18n._("hello")',
      name: 'allows i18n with string literal',
    },

    // ==================== Non-Word Strings ====================
    {
      code: 'const test = "1111"',
      name: 'ignores numeric strings',
    },
    {
      code: 'const a = `0123456789!@#$%^&*()_+|~-=\\`[]{};\':",./<>?`;',
      name: 'ignores special character strings',
    },

    // ==================== Template Literals with Variables ====================
    {
      code: 'const t = `${BRAND_NAME}`',
      name: 'allows template literal with single variable',
    },
    {
      code: 'const t = `${BRAND_NAME}${BRAND_NAME}`',
      name: 'allows template literal with multiple variables',
    },
    {
      code: 'const t = ` ${BRAND_NAME} ${BRAND_NAME} `',
      name: 'allows template literal with variables and spaces',
    },

    // ==================== Ignored Functions ====================
    {
      code: 'hello("Hello")',
      options: [{ ignoreFunctions: ['hello'] }],
      name: 'allows whitelisted function calls',
    },
    {
      code: 'new Error("hello")',
      options: [{ ignoreFunctions: ['Error'] }],
      name: 'allows whitelisted constructor calls',
    },
    {
      code: 'custom.wrapper()({message: "Hello!"})',
      options: [{ ignoreFunctions: ['custom.wrapper'] }],
      name: 'allows nested whitelisted function calls',
    },
    {
      code: 'getData().two.three.four("Hello")',
      options: [{ ignoreFunctions: ['*.three.four'] }],
      name: 'allows whitelisted methods with wildcards',
    },

    // ==================== Console Methods ====================
    {
      code: 'console.log("Hello"); console.error("Hello");',
      options: [{ ignoreFunctions: ['console.*'] }],
      name: 'allows console methods with pattern matching',
    },
    {
      code: 'context.headers.set("Hello"); level.context.headers.set("Hello");',
      options: [{ ignoreFunctions: ['*.headers.set'] }],
      name: 'allows multilevel method calls with wildcards',
    },

    // ==================== JSX Attributes ====================
    {
      code: '<div className="primary"></div>',
      name: 'allows className attribute',
    },
    {
      code: '<div className={`primary`}></div>',
      name: 'allows className with template literal',
    },
    {
      code: '<div className={a ? "active": "inactive"}></div>',
      name: 'allows className with conditional',
    },

    // ==================== SVG Elements ====================
    {
      code: '<svg viewBox="0 0 20 40"></svg>',
      name: 'allows SVG viewBox attribute',
    },
    {
      code: '<path d="M10 10" />',
      name: 'allows SVG path data',
    },
    {
      code: '<circle width="16px" height="16px" cx="10" cy="10" r="2" fill="red" />',
      name: 'allows SVG circle attributes',
    },

    // ==================== Translation Components ====================
    {
      code: '<Trans>Hello</Trans>',
      name: 'allows basic Trans component',
    },
    {
      code: '<Trans><Component>Hello</Component></Trans>',
      name: 'allows nested Trans component',
    },
    {
      code: "<Plural value={5} one='# Book' other='# Books' />",
      name: 'allows Plural component',
    },
    {
      code: "<Select male='Ola!' other='Hello' />",
      name: 'allows Select component',
    },

    // ==================== TypeScript Types ====================
    {
      code: "interface FieldLabelProps { 'htmlFor': string; }",
      name: 'allows interface with HTML attributes',
    },
    {
      code: "interface FieldInputProps { 'aria-required': boolean; }",
      name: 'allows interface with ARIA attributes',
    },
    {
      code: `type ButtonVariant = 'primary' | 'secondary' | 'tertiary';`,
      name: 'allows string literal union types',
    },
    {
      code: `enum StepType { Address = 'Address' }`,
      name: 'allows enum with string values',
    },

    // ==================== Uppercase Variable Names ====================
    {
      code: 'const A_B = "Bar!"',
      options: [ignoreUpperCaseName],
      name: 'allows uppercase snake case variable',
    },
    {
      code: 'const FOO = `Bar!`',
      options: [ignoreUpperCaseName],
      name: 'allows uppercase variable with template literal',
    },
    {
      code: 'var a = {A_B: "hello world"};',
      options: [ignoreUpperCaseName],
      name: 'allows uppercase property name',
    },
    {
      code: 'var a = {["A_B"]: "hello world"};',
      options: [ignoreUpperCaseName],
      name: 'allows uppercase computed property',
    },
    {
      code: 'var a = {[A_B]: "hello world"};',
      options: [ignoreUpperCaseName],
      name: 'allows uppercase identifier in computed property',
    },
    {
      code: 'var a = {[`A_B`]: `hello world`};',
      options: [ignoreUpperCaseName],
      name: 'allows uppercase template literal in computed property',
    },

    // ==================== Import/Export ====================
    {
      code: 'import name from "hello";',
      name: 'allows string literals in imports',
    },
    {
      code: 'export * from "hello_export_all";',
      name: 'allows string literals in exports',
    },
  ],

  invalid: [
    // ==================== Basic String Violations ====================
    {
      code: 'const message = "Select tax code"',
      errors: defaultError,
      name: 'detects unlocalized string literal',
    },
    {
      code: 'export const text = "hello string";',
      errors: defaultError,
      name: 'detects unlocalized export',
    },
    {
      code: 'const a = `Hello ${nice}`',
      errors: defaultError,
      name: 'detects unlocalized template literal',
    },

    // ==================== JSX Violations ====================
    {
      code: '<div>hello &nbsp; </div>',
      errors: jsxTextError,
      name: 'detects unlocalized JSX text with HTML entity',
    },
    {
      code: '<div>{"Hello World!"}</div>',
      errors: jsxTextError,
      name: 'detects unlocalized JSX expression',
    },

    // ==================== Non-Latin Character Support ====================
    {
      code: 'const a = "こんにちは"',
      errors: defaultError,
      name: 'detects unlocalized Japanese text',
    },
    {
      code: 'const a = "Привет"',
      errors: defaultError,
      name: 'detects unlocalized Cyrillic text',
    },
    {
      code: 'const a = "添加筛选器"',
      errors: defaultError,
      name: 'detects unlocalized Chinese text',
    },

    // ==================== Component Attributes ====================
    {
      code: '<img src="./image.png" alt="some image" />',
      errors: defaultError,
      name: 'detects unlocalized alt text',
    },
    {
      code: '<button aria-label="Close" type="button" />',
      errors: defaultError,
      name: 'detects unlocalized ARIA label',
    },

    // ==================== Class Properties ====================
    {
      code: 'class Form extends Component { property = "Something" };',
      errors: defaultError,
      name: 'detects unlocalized class property',
    },

    // ==================== Uppercase Name Violations ====================
    {
      code: 'const lower_case = "Bar!"',
      options: [ignoreUpperCaseName],
      errors: defaultError,
      name: 'detects lowercase name with ignoreUpperCaseName',
    },
    {
      code: 'const camelCase = "Bar!"',
      options: [ignoreUpperCaseName],
      errors: defaultError,
      name: 'detects camelCase name with ignoreUpperCaseName',
    },
    {
      code: 'var obj = {lowercase_key: "hello world"};',
      options: [ignoreUpperCaseName],
      errors: defaultError,
      name: 'detects lowercase property with ignoreUpperCaseName',
    },
  ],
})

// ==================== Default Ignore Regex Tests ====================
describe('Default ignore regex', () => {
  const regex = '^(?![A-Z])\\S+$'

  test.each([
    ['hello', true, 'allows lowercase word'],
    ['helloMyVar', true, 'allows camelCase'],
    ['package.json', true, 'allows filenames'],
    ['./src/**/*.test*', true, 'allows paths'],
    ['camel_case', true, 'allows snake_case'],
    ['Hello', false, 'blocks capitalized words'],
    ['hello world', false, 'blocks strings with spaces'],
    ['Hello World', false, 'blocks title case with spaces'],
  ])('%s => %s (%s)', (input, expected, description) => {
    expect(new RegExp(regex).test(input)).toBe(expected)
  })
})
