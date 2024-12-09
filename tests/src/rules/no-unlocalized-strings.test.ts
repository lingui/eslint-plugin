import { rule, name, Option } from '../../../src/rules/no-unlocalized-strings'
import { RuleTester } from '@typescript-eslint/rule-tester'

describe('', () => {})

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
    },
  },
})

const upperCaseRegex = '^[A-Z_-]+$'
const ignoreUpperCaseName = { ignoreNames: [{ regex: { pattern: upperCaseRegex } }] }

const errors = [{ messageId: 'default' }] // default errors

ruleTester.run<string, Option[]>(name, rule, {
  valid: [
    {
      code: 'i18n._(t`Hello ${nice}`)',
    },
    { code: 't(i18n)({ message: `Hello ${name}` })' },
    {
      name: 'should ignore non word strings',
      code: 'const test = "1111"',
    },
    {
      name: 'should ignore non word strings 2',
      code: 'const a = `0123456789!@#$%^&*()_+|~-=\\`[]{};\':",./<>?`;',
    },
    {
      name: 'should ignore strings containing only variables',
      code: 'const t = `${BRAND_NAME}`',
    },
    {
      name: 'should ignore strings containing few variables',
      code: 'const t = `${BRAND_NAME}${BRAND_NAME}`',
    },
    {
      name: 'should ignore strings containing few variables with spaces',
      code: 'const t = ` ${BRAND_NAME} ${BRAND_NAME} `',
    },
    {
      code: 'hello("Hello")',
      options: [{ ignoreFunctions: ['hello'] }],
    },
    {
      code: 'new Error("hello")',
      options: [{ ignoreFunctions: ['Error'] }],
    },
    {
      code: 'custom.wrapper()({message: "Hello!"})',
      options: [{ ignoreFunctions: ['custom.wrapper'] }],
    },
    {
      name: 'Should ignore calls using complex object.method expression',
      code: 'console.log("Hello")',
      options: [{ ignoreFunctions: ['console.log'] }],
    },
    {
      name: 'Should ignore method calls using pattern',
      code: 'console.log("Hello"); console.error("Hello");',
      options: [{ ignoreFunctions: ['console.*'] }],
    },
    {
      name: 'Should ignore methods multilevel',
      code: 'context.headers.set("Hello"); level.context.headers.set("Hello");',
      options: [{ ignoreFunctions: ['*.headers.set'] }],
    },
    {
      name: 'Should ignore methods multilevel 2',
      code: 'headers.set("Hello"); level.context.headers.set("Hello");',
      options: [{ ignoreFunctions: ['*headers.set'] }],
    },
    {
      name: 'Should ignore methods with dynamic segment ',
      code: 'getData().two.three.four("Hello")',
      options: [{ ignoreFunctions: ['*.three.four'] }],
    },
    { code: 'name === `Hello brat` || name === `Nice have`' },
    { code: 'switch(a){ case `a`: break; default: break;}' },
    { code: 'i18n._(`hello`);' },
    { code: 'const a = `absfoo`;', options: [{ ignore: ['foo'] }] },
    { code: 'const a = `fooabc`;', options: [{ ignore: ['^foo'] }] },
    { code: "name === 'Hello brat' || name === 'Nice have'" },
    { code: "switch(a){ case 'a': break; default: break;}" },
    { code: 'import name from "hello";' },
    { code: 'export * from "hello_export_all";' },
    { code: 'export { a } from "hello_export";' },
    { code: 'const a = require(["hello"]);', options: [{ ignoreFunctions: ['require'] }] },
    { code: 'const a = require(["hel" + "lo"]);', options: [{ ignoreFunctions: ['require'] }] },
    { code: 'const a = 1;' },
    { code: 'i18n._("hello");' },
    { code: 'const a = "absfoo";', options: [{ ignore: ['foo'] }] },
    { code: 'const a = "fooabc";', options: [{ ignore: ['^foo'] }] },

    //     // JSX
    { code: '<div className="primary"></div>' },
    { code: '<div className={`primary`}></div>' },
    {
      name: 'Should ignore non-word strings in the JSX Text',
      code: `<span>+</span>`,
    },
    {
      name: 'Should JSX Text if it matches the ignore option',
      code: `<span>foo</span>`,
      options: [{ ignore: ['^foo'] }],
    },
    { code: '<div className={a ? "active": "inactive"}></div>' },
    { code: '<div className={a ? `active`: `inactive`}></div>' },
    { code: '<div>{i18n._("foo")}</div>' },
    { code: '<svg viewBox="0 0 20 40"></svg>' },
    { code: '<svg viewBox={`0 0 20 40`}></svg>' },
    { code: '<line x1="0" y1="0" x2="10" y2="20" />' },
    { code: '<line x1={`0`} y1={`0`} x2={`10`} y2={`20`} />' },
    { code: '<path d="M10 10" />' },
    { code: '<path d={`M10 10`} />' },
    {
      code: '<circle width="16px" height="16px" cx="10" cy="10" r="2" fill="red" />',
    },
    {
      code: '<circle width={`16px`} height={`16px`} cx={`10`} cy={`10`} r={`2`} fill={`red`} />',
    },
    {
      code: '<a href="https://google.com" target="_blank" rel="noreferrer noopener"></a>',
    },
    {
      code: '<a href={`https://google.com`} target={`_blank`} rel={`noreferrer noopener`}></a>',
    },
    {
      code: '<div id="some-id" tabIndex="0" aria-labelledby="label-id"></div>',
    },
    {
      code: '<div id={`some-id`} tabIndex={`0`} aria-labelledby={`label-id`}></div>',
    },
    { code: '<div role="button"></div>' },
    { code: '<div role={`button`}></div>' },
    { code: '<img src="./image.png" />' },
    { code: '<img src={`./image.png`} />' },
    { code: '<button type="button" for="form-id" />' },
    { code: '<button type={`button`} for={`form-id`} />' },
    {
      name: 'JSX Space should not be flagged',
      code: `<button>{' '}</button>`,
    },
    { code: '<DIV foo="bar" />', options: [{ ignoreNames: ['foo'] }] },
    { code: '<DIV foo={`Bar`} />', options: [{ ignoreNames: ['foo'] }] },
    {
      code: '<DIV wrapperClassName={`Bar`} />',
      options: [{ ignoreNames: [{ regex: { pattern: 'className', flags: 'i' } }] }],
    },
    { code: '<div>&nbsp; </div>' },
    { code: "plural('Hello')" },
    { code: "select('Hello')" },
    { code: "selectOrdinal('Hello')" },
    { code: 'msg({message: `Hello!`})' },
    {
      code: `<Input
          {...restProps}
          autoComplete="off"
      />`,
      options: [{ ignoreNames: ['autoComplete'] }],
    },
    {
      code: 'const Wrapper = styled.a` cursor: pointer; ${(props) => props.isVisible && `visibility: visible;`}`',
    },
    {
      code: "const Wrapper = styled.a` cursor: pointer; ${(props) => props.isVisible && 'visibility: visible;'}`",
    },
    {
      code: `const test = { myProp: 'This is not localized' }`,
      options: [{ ignoreNames: ['myProp'] }],
    },
    {
      code: 'const test = { myProp: `This is not localized` }',
      options: [{ ignoreNames: ['myProp'] }],
    },
    {
      code: `const test = { ['myProp']: 'This is not localized' }`,
      options: [{ ignoreNames: ['myProp'] }],
    },
    {
      code: `const test = { wrapperClassName: 'This is not localized' }`,
      options: [{ ignoreNames: [{ regex: { pattern: 'className', flags: 'i' } }] }],
    },
    {
      code: `MyComponent.displayName = 'MyComponent';`,
      options: [{ ignoreNames: ['displayName'] }],
    },
    {
      code: 'class Form extends Component { displayName = "FormContainer" };',
      options: [{ ignoreNames: ['displayName'] }],
    },
    {
      name: 'Respect the name of the parameter when a default is applied',
      code: 'function Input({ intent = "none"}) {}',
      options: [{ ignoreNames: ['intent'] }],
    },
    {
      name: "Should support ignoreNames when applied the 'as const' assertion",
      code: 'const Shape = { CIRCLE: "circle" as const };',
      options: [{ ignoreNames: [{ regex: { pattern: '^[A-Z0-9_-]+$' } }] }],
    },
    {
      name: 'Does not report when literal is assigned to an object property named in ignoreNames',
      code: 'const x = { variant: "Hello!" }',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Does not report when template literal is assigned to an object property named in ignoreNames',
      code: 'const x = { variant: `Hello ${"World"}` }',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Does not report with nullish coalescing inside object property named in ignoreNames',
      code: 'const x = { variant: props.variant ?? "body" }',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Does not report with ternary operator inside object property named in ignoreNames',
      code: 'const x = { variant: condition ? "yes" : "no" }',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'computed keys should be ignored by default, StringLiteral',
      code: `obj["key with space"] = 5`,
    },
    {
      name: 'computed keys should be ignored by default with TplLiteral',
      code: `obj[\`key with space\`] = 5`,
    },
    {
      name: 'Supports default value assignment',
      code: 'const variant = input || "body"',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Supports nullish coalescing operator',
      code: 'const variant = input ?? "body"',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Supports ternary operator',
      code: 'const value = condition ? "yes" : "no"',
      options: [{ ignoreNames: ['value'] }],
    },
    {
      name: 'Supports default value assignment - template literal version',
      code: 'const variant = input || `body`',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Supports nullish coalescing operator - template literal version',
      code: 'const variant = input ?? `body`',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Supports ternary operator - template literal version',
      code: 'const value = condition ? `yes` : `no`',
      options: [{ ignoreNames: ['value'] }],
    },
    {
      name: 'Ignores literals in assignment expression after variable declaration',
      code: `let variant; variant = input ?? "body";`,
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Ignores literals in assignment expression to variable in ignoreNames',
      code: `let variant; variant = "body";`,
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Ignores literals assigned to object properties when property name is in ignoreNames',
      code: `const obj = {}; obj.variant = "body";`,
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Covers Literal in a nullish coalescing acceptable expression',
      code: 'const variant = input ?? "Hello!";',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      name: 'Covers TemplateLiteral in a ternary acceptable expression',
      code: 'const variant = condition ? `Hello ${"World"}` : `Fallback`;',
      options: [{ ignoreNames: ['variant'] }],
    },
    {
      code: `const test = "Hello!"`,
      options: [{ ignoreNames: ['test'] }],
    },
    {
      code: `let test = "Hello!"`,
      options: [{ ignoreNames: ['test'] }],
    },
    {
      code: `var test = "Hello!"`,
      options: [{ ignoreNames: ['test'] }],
    },
    {
      code: 'const test = `Hello!`',
      options: [{ ignoreNames: ['test'] }],
    },
    {
      code: `const wrapperClassName  = "Hello!"`,
      options: [{ ignoreNames: [{ regex: { pattern: 'className', flags: 'i' } }] }],
    },
    {
      code: `const A_B  = "Bar!"`,
      options: [ignoreUpperCaseName],
    },
    {
      code: 'const FOO  = `Bar!`',
      options: [ignoreUpperCaseName],
    },
    { code: 'var a = {["A_B"]: "hello world"};', options: [ignoreUpperCaseName] },
    { code: 'var a = {[A_B]: "hello world"};', options: [ignoreUpperCaseName] },
    { code: 'var a = {A_B: "hello world"};', options: [ignoreUpperCaseName] },
    { code: 'var a = {[`A_B`]: `hello world`};', options: [ignoreUpperCaseName] },
    { code: 'var a = {[A_B]: `hello world`};', options: [ignoreUpperCaseName] },
    { code: 'var a = {A_B: `hello world`};', options: [ignoreUpperCaseName] },

    { code: '<div className="hello"></div>', filename: 'a.tsx' },
    { code: '<div className={`hello`}></div>', filename: 'a.tsx' },
    { code: "var a: Element['nodeName']" },
    { code: "var a: Omit<T, 'af'>" },
    { code: `var a: 'abc' = 'abc'`, skip: true },
    { code: `var a: 'abc' | 'name'  | undefined= 'abc'`, skip: true },
    { code: "type T = {name: 'b'} ; var a: T =  {name: 'b'}", skip: true },
    { code: "function Button({ t= 'name' }: {t: 'name'}){} ", skip: true },
    { code: "type T = { t?: 'name'| 'abc'}; function Button({t='name'}:T){}", skip: true },
    {
      code: `enum StepType {
        Address = 'Address'
      }`,
    },
    {
      code: `enum StepType {
        Address = \`Address\`
      }`,
    },

    {
      code: `const myMap = new Map();
      myMap.get("string with a spaces")
      myMap.has("string with a spaces")`,
      options: [{ useTsTypes: true, ignoreMethodsOnTypes: ['Map.get', 'Map.has'] }],
    },
    {
      code: `interface Foo {get: (key: string) => string};
      (foo as Foo).get("string with a spaces")`,
      options: [{ useTsTypes: true, ignoreMethodsOnTypes: ['Foo.get'] }],
    },
    {
      code: `interface Foo {get: (key: string) => string};
      const foo: Foo;
      foo.get("string with a spaces")`,
      options: [{ useTsTypes: true, ignoreMethodsOnTypes: ['Foo.get'] }],
    },
    {
      name: 'interface property with html attribute',
      code: "interface FieldLabelProps { 'htmlFor': string; }",
    },
    {
      name: 'interface property with aria attribute',
      code: "interface FieldInputProps { 'aria-required': boolean; }",
    },
    {
      name: 'type alias with string literal properties',
      code: `
        type ButtonProps = {
          'aria-pressed': boolean;
          'data-testid': string;
        }
      `,
    },
    {
      name: 'interface with nested type',
      code: `
        interface ComplexProps {
          details: {
            'nested-attr': string;
          };
        }
      `,
    },
    {
      name: 'interface with string literal type',
      code: `
        interface Props {
          message: 'This is a type';
          variant: 'primary' | 'secondary';
        }
      `,
    },
    {
      name: 'type alias with string literal union',
      code: "type ButtonVariant = 'primary' | 'secondary' | 'tertiary';",
    },
    {
      name: 'interface with optional property using string literal type',
      code: `
        interface Props {
          type?: 'success' | 'error';
          message: string;
        }
      `,
    },
    {
      name: 'type with index signature using string literal',
      code: `
        type Dict = {
          [K in 'foo' | 'bar']: string;
        }
      `,
    },
    {
      name: 'interface with index signature using string literal',
      code: `
        interface Dict {
          ['some-key']: string;
        }
      `,
    },
    {
      name: 'JSX with empty text',
      code: `
        function Component() {
          return <div>
            {/* this creates an empty JSXText node */}
          </div>
        }
      `,
    },
    {
      name: 'property key in type literal',
      code: `
        type Options = {
          'some-key': {
            'nested-key': string;
          }
        }
      `,
    },
    {
      name: 'JSX with empty template literal in expression container',
      code: 'function Component() { return <div>{``}</div> }',
    },
    {
      name: 'JSX with empty text node',
      code: `
        function Component() {
          return <div>

          </div>
        }
      `,
    },
    {
      name: 'JSX with empty string literal',
      code: `
        function Component() {
          return <div>
            {''}
          </div>
        }
      `,
    },
  ],

  invalid: [
    { code: '<div>hello &nbsp; </div>', errors: [{ messageId: 'forJsxText' }] },
    { code: 'const a = `Hello ${nice}`', errors },
    { code: 'export const a = `hello string`;', errors },
    { code: "const ge = 'Select tax code'", errors },
    { code: 'const a = `Foo`;', errors },
    {
      name: 'Reports error for unlocalized strings inside JSX',
      code: '<div>{"Hello World!"}</div>',
      errors: [{ messageId: 'forJsxText', line: 1, column: 7 }],
    },
    {
      name: 'Reports error when variable name is not in ignoreNames',
      code: 'const other = input ?? "body";',
      options: [{ ignoreNames: ['variant'] }],
      errors: [{ messageId: 'default', line: 1, column: 24 }],
    },
    {
      code: 'const comp = <div>{myFunction("Hello world")}</div>',
      errors: [{ messageId: 'default' }],
    },
    {
      name: 'Reports error for assignment expression to variable not in ignoreNames',
      code: `let otherVariable; otherVariable = "body";`,
      options: [{ ignoreNames: ['variant'] }],
      errors: [{ messageId: 'default', line: 1, column: 36 }],
    },
    {
      name: 'Reports error for assignment expression to object property not in ignoreNames',
      code: 'const variant = myFunction({someProperty: "Hello World!"})',
      options: [{ ignoreNames: ['variant'] }],
      errors: [{ messageId: 'default', line: 1, column: 43 }],
    },
    { code: 'const a = call(`Ffo`);', errors },
    { code: 'var a = {foo: `Bar`};', errors },
    {
      name: 'Should report non latin messages (japanese)',
      code: 'const a = "こんにちは"',
      errors,
    },
    {
      name: 'Should report non latin messages (cyrillic)',
      code: 'const a = "Привет"',
      errors,
    },
    {
      name: 'Should report non latin messages (chinese)',
      code: 'const a = "添加筛选器"',
      errors,
    },
    { code: 'const a = `a foo`;', options: [{ ignore: ['^foo'] }], errors },
    {
      code: 'class Form extends Component { property = `Something` };',
      errors,
    },
    { code: '<DIV foo={`Bar`} />', errors },
    { code: '<img src="./image.png" alt={`some image`} />', errors },
    { code: '<button aria-label={`Close`} type={`button`} />', errors },
    { code: 'a + "Bola"', errors },
    {
      code: "switch(a){ case 'a': var a ='Bola'; break; default: break;}",
      errors,
    },
    { code: 'export const a = "hello string";', errors },
    { code: 'const a = "Foo";', errors },
    { code: 'const a = call("Ffo");', errors },
    { code: 'var a = {foo: "Bar"};', errors },
    {
      code: 'const a = "aFoo hello";',
      options: [{ ignore: ['^Foo'] }],
      errors,
    },
    {
      code: 'class Form extends Component { property = "Something" };',
      errors,
    },
    { code: '<div>foo</div>', errors: [{ messageId: 'forJsxText' }] },
    { code: '<div>Foo</div>', errors: [{ messageId: 'forJsxText' }] },
    { code: '<div>FOO</div>', errors: [{ messageId: 'forJsxText' }] },
    { code: '<DIV foo="Bar" />', errors },
    { code: '<img src="./image.png" alt="some image" />', errors },
    { code: '<button aria-label="Close" type="button" />', errors },
    { code: `const test = { text: 'This is not localized' }`, errors },

    {
      code: `const notAMap: {get: (key: string) => string}; notAMap.get("string with a spaces")`,
      options: [{ useTsTypes: true }],
      errors,
    },
    { code: `var a = 'Hello guys'`, errors },
    {
      code: `<button className={styles.btn}>loading</button>`,
      filename: 'a.tsx',
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: `<button className={styles.btn}>Loading</button>`,
      filename: 'a.tsx',
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: "function Button({ t= 'Name'  }: {t: 'name' &  'Abs'}){} ",
      errors,
    },
    {
      code: "function Button({ t= 'Name'  }: {t: 1 |  'Abs'}){} ",
      errors,
    },
    { code: "var a: {text: string} = {text: 'Bold'}", errors },
    {
      code: `function getQueryPlaceholder(compact: boolean | undefined) {
        return compact || mobileMediaQuery.matches
            ? 'Search'
            : 'Search for accounts, merchants, and more...'
    }`,
      errors: [{ messageId: 'default' }, { messageId: 'default' }],
    },
    {
      name: 'object literal properties should still be checked',
      code: `
        const props = {
          label: 'This should be translated'
        };
      `,
      errors: [{ messageId: 'default' }],
    },
    {
      name: 'regular string assignments should still be checked',
      code: `
        let message = 'This should be translated';
      `,
      errors: [{ messageId: 'default' }],
    },
  ],
})

const jsxTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

jsxTester.run('no-unlocalized-strings', rule, {
  valid: [
    { code: '<Component>{ i18n._("abc") }</Component>' },
    { code: '<Component>{ i18n._(`abc`) }</Component>' },
    {
      name: 'Should not flag the JSX text with only spaces and interpolations',
      code: `<Component>
        {variable}
        </Component>`,
    },
    { code: '<Trans>Hello</Trans>' },
    { code: '<Trans><Component>Hello</Component></Trans>' },
    {
      code: `<Trans>
                Your virtual card is ready to be used right <strong>now</strong> for
                online purchases and subscriptions
            </Trans>`,
    },
    {
      code: `<Trans id="missingReceipts.subtitle" description="Call to action on missing receipt banner" />`,
    },
    {
      code: `<Trans id="missingReceipts.subtitle" description={"Call to action on missing receipt banner"} />`,
    },
    {
      code: '<Trans id="missingReceipts.subtitle" description={`Call to action on missing receipt banner`} />',
    },
    { code: "<Plural value={5} one='# Book' other='# Books' /> " },
    { code: '<Plural value={5} one={<># Book</>} other={<># Books</>} /> ' },
    { code: "<Select male='Ola!' other='Hello' /> " },
    { code: "<SelectOrdinal value='Hello' one='2' other='Hello' /> " },
  ],
  invalid: [
    {
      code: '<Component>Abc</Component>',
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: '<Component>{"Hello"}</Component>',
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: '<Component>{`Hello`}</Component>',
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: '<Component>abc</Component>',
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: "<Component>{'abc'}</Component>",
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: '<Component>{`abc`}</Component>',
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: '<Component>{someVar === 1 ? `Abc` : `Def`}</Component>',
      errors: [{ messageId: 'default' }, { messageId: 'default' }],
    },
  ],
})

/**
 * This test is covering the ignore regex proposed in the documentation
 * This regex doesn't used directly in the code.
 */
describe('Default ignore regex', () => {
  const regex = '^(?![A-Z])\\S+$'

  test.each([
    ['hello', true],
    ['helloMyVar', true],
    ['package.json', true],
    ['./src/**/*.test*', true],
    ['camel_case', true],

    // Start from capital letter
    ['Hello', false],
    // Multiword string (has space)
    ['hello world', false],
    ['Hello World', false],
  ])('validate %s', (str, pass) => {
    expect(new RegExp(regex).test(str)).toBe(pass)
  })
})
