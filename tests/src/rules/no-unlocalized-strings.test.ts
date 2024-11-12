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
const ignoreUpperCaseVariable = { ignoreVariable: [{ regex: { pattern: upperCaseRegex } }] }
const ignoreUpperCaseProperty = { ignoreProperty: [{ regex: { pattern: upperCaseRegex } }] }

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
      code: 'hello("Hello")',
      options: [{ ignoreFunction: ['hello'] }],
    },
    {
      code: 'new Error("hello")',
      options: [{ ignoreFunction: ['Error'] }],
    },
    {
      code: 'custom.wrapper()({message: "Hello!"})',
      options: [{ ignoreFunction: ['custom.wrapper'] }],
    },
    {
      name: 'Should ignore calls using complex object.method expression',
      code: 'console.log("Hello")',
      options: [{ ignoreFunction: ['console.log'] }],
    },
    {
      name: 'Should ignore method calls using pattern',
      code: 'console.log("Hello"); console.error("Hello");',
      options: [{ ignoreFunction: ['console.*'] }],
    },
    {
      name: 'Should ignore methods multilevel',
      code: 'context.headers.set("Hello"); level.context.headers.set("Hello");',
      options: [{ ignoreFunction: ['*.headers.set'] }],
    },
    {
      name: 'Should ignore methods multilevel 2',
      code: 'headers.set("Hello"); level.context.headers.set("Hello");',
      options: [{ ignoreFunction: ['*headers.set'] }],
    },
    {
      name: 'Should ignore methods with dynamic segment ',
      code: 'getData().two.three.four("Hello")',
      options: [{ ignoreFunction: ['*.three.four'] }],
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
    { code: 'const a = require(["hello"]);', options: [{ ignoreFunction: ['require'] }] },
    { code: 'const a = require(["hel" + "lo"]);', options: [{ ignoreFunction: ['require'] }] },
    { code: 'const a = 1;' },
    { code: 'i18n._("hello");' },
    { code: 'const a = "absfoo";', options: [{ ignore: ['foo'] }] },
    { code: 'const a = "fooabc";', options: [{ ignore: ['^foo'] }] },

    //     // JSX
    { code: '<div className="primary"></div>' },
    { code: '<div className={`primary`}></div>' },
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
    { code: '<DIV foo="bar" />', options: [{ ignoreAttribute: ['foo'] }] },
    { code: '<DIV foo={`Bar`} />', options: [{ ignoreAttribute: ['foo'] }] },
    {
      code: '<DIV wrapperClassName={`Bar`} />',
      options: [{ ignoreAttribute: [{ regex: { pattern: 'className', flags: 'i' } }] }],
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
      options: [{ ignoreAttribute: ['autoComplete'] }],
    },
    {
      code: 'const Wrapper = styled.a` cursor: pointer; ${(props) => props.isVisible && `visibility: visible;`}`',
    },
    {
      code: "const Wrapper = styled.a` cursor: pointer; ${(props) => props.isVisible && 'visibility: visible;'}`",
    },
    {
      code: `const test = { myProp: 'This is not localized' }`,
      options: [{ ignoreProperty: ['myProp'] }],
    },
    {
      code: 'const test = { myProp: `This is not localized` }',
      options: [{ ignoreProperty: ['myProp'] }],
    },
    {
      code: `const test = { ['myProp']: 'This is not localized' }`,
      options: [{ ignoreProperty: ['myProp'] }],
    },
    {
      code: `const test = { wrapperClassName: 'This is not localized' }`,
      options: [{ ignoreProperty: [{ regex: { pattern: 'className', flags: 'i' } }] }],
    },
    {
      code: `MyComponent.displayName = 'MyComponent';`,
      options: [{ ignoreProperty: ['displayName'] }],
    },
    {
      code: 'class Form extends Component { displayName = "FormContainer" };',
      options: [{ ignoreProperty: ['displayName'] }],
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
      code: `const test = "Hello!"`,
      options: [{ ignoreVariable: ['test'] }],
    },
    {
      code: `let test = "Hello!"`,
      options: [{ ignoreVariable: ['test'] }],
    },
    {
      code: `var test = "Hello!"`,
      options: [{ ignoreVariable: ['test'] }],
    },
    {
      code: 'const test = `Hello!`',
      options: [{ ignoreVariable: ['test'] }],
    },

    {
      code: `const wrapperClassName  = "Hello!"`,
      options: [{ ignoreVariable: [{ regex: { pattern: 'className', flags: 'i' } }] }],
    },
    {
      code: `const A_B  = "Bar!"`,
      options: [ignoreUpperCaseVariable],
    },
    {
      code: 'const FOO  = `Bar!`',
      options: [ignoreUpperCaseVariable],
    },
    { code: 'var a = {["A_B"]: "hello world"};', options: [ignoreUpperCaseProperty] },
    { code: 'var a = {[A_B]: "hello world"};', options: [ignoreUpperCaseProperty] },
    { code: 'var a = {A_B: "hello world"};', options: [ignoreUpperCaseProperty] },
    { code: 'var a = {[`A_B`]: `hello world`};', options: [ignoreUpperCaseProperty] },
    { code: 'var a = {[A_B]: `hello world`};', options: [ignoreUpperCaseProperty] },
    { code: 'var a = {A_B: `hello world`};', options: [ignoreUpperCaseProperty] },

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
  ],

  invalid: [
    { code: '<div>hello &nbsp; </div>', errors: [{ messageId: 'forJsxText' }] },
    { code: 'const a = `Hello ${nice}`', errors },
    { code: 'export const a = `hello string`;', errors },
    { code: "const ge = 'Select tax code'", errors },
    { code: 'const a = `Foo`;', errors },
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
    { code: '<img alt="BLA" />', options: [{ strictAttribute: ['alt'] }], errors },
    {
      code: '<img altAaa="BLA" />',
      options: [{ strictAttribute: [{ regex: { pattern: '^alt' } }] }],
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
      errors,
    },
    {
      code: '<Component>{`Hello`}</Component>',
      errors,
    },
    {
      code: '<Component>abc</Component>',
      errors: [{ messageId: 'forJsxText' }],
    },
    {
      code: "<Component>{'abc'}</Component>",
      errors,
    },
    {
      code: '<Component>{`abc`}</Component>',
      errors,
    },
    {
      code: '<Component>{someVar === 1 ? `Abc` : `Def`}</Component>',
      errors: [{ messageId: 'default' }, { messageId: 'default' }],
    },
  ],
})
