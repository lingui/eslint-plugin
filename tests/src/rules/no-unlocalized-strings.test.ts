import { TYPESCRIPT_ESLINT } from '../../helpers/parsers'
import rule, { Option } from '../../../src/rules/no-unlocalized-strings'
import { RuleTester } from '@typescript-eslint/utils/dist/ts-eslint/RuleTester'

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const message = 'disallow literal string'
const errors = [{ messageId: 'default', data: { message } }] // default errors

const ruleTester = new RuleTester({
  parser: TYPESCRIPT_ESLINT,
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
})
ruleTester.run<string, Option[]>('no-unlocalized-strings', rule, {
  valid: [
    {
      code: 'i18n._(t`Hello ${nice}`)',
    },
    { code: 't(i18n)({ message: `Hello ${name}` })' },
    {
      code: 'custom.wrapper()({message: "Hello!"})',
      options: [{ ignoreFunction: ['custom.wrapper'] }],
    },
    { code: 'name === `Hello brat` || name === `Nice have`' },
    { code: 'switch(a){ case `a`: break; default: break;}' },
    { code: 'a.indexOf(`ios`)' },
    { code: 'a.includes(`ios`)' },
    { code: 'a.startsWith(`ios`)' },
    { code: 'a.endsWith(`@gmail.com`)' },
    {
      code: 'document.addEventListener(`click`, (event) => { event.preventDefault() })',
    },
    {
      code: 'document.removeEventListener(`click`, (event) => { event.preventDefault() })',
    },
    { code: 'window.postMessage(`message`, `*`)' },
    { code: 'document.getElementById(`some-id`)' },
    { code: 'require(`hello`);' },
    { code: 'const a = require([`hello`]);' },
    { code: 'const a = require([`hel` + `lo`]);' },
    { code: 'const a = `?`;' },
    { code: 'const a = `0123456789!@#$%^&*()_+|~-=\\`[]{};\':",./<>?`;' },
    { code: 'i18n._(`hello`);' },
    { code: 'dispatch(`hello`);' },
    { code: 'store.dispatch(`hello`);' },
    { code: 'store.commit(`hello`);' },
    { code: 'const a = `absfoo`;', options: [{ ignore: ['foo'] }] },
    { code: 'const a = `fooabc`;', options: [{ ignore: ['^foo'] }] },
    { code: 'const a = `FOO`;' },
    { code: "name === 'Hello brat' || name === 'Nice have'" },
    { code: "switch(a){ case 'a': break; default: break;}" },
    { code: 'import name from "hello";' },
    { code: 'a.indexOf("ios")' },
    { code: 'a.includes("ios")' },
    { code: 'a.startsWith("ios")' },
    { code: 'a.endsWith("@gmail.com")' },
    { code: 'export * from "hello_export_all";' },
    { code: 'export { a } from "hello_export";' },
    {
      code: 'document.addEventListener("click", (event) => { event.preventDefault() })',
    },
    {
      code: 'document.removeEventListener("click", (event) => { event.preventDefault() })',
    },
    { code: 'window.postMessage("message", "*")' },
    { code: 'document.getElementById("some-id")' },
    { code: 'require("hello");' },
    { code: 'const a = require(["hello"]);' },
    { code: 'const a = require(["hel" + "lo"]);' },
    { code: 'const a = 1;' },
    { code: 'const a = "?";' },
    { code: `const a = "0123456789!@#$%^&*()_+|~-=\`[]{};':\\",./<>?";` },
    { code: 'i18n._("hello");' },
    { code: 'dispatch("hello");' },
    { code: 'store.dispatch("hello");' },
    { code: 'store.commit("hello");' },
    { code: 'i18n._("hello");' },
    { code: 'const a = "absfoo";', options: [{ ignore: ['foo'] }] },
    { code: 'const a = "fooabc";', options: [{ ignore: ['^foo'] }] },
    { code: 'const a = "FOO";' },
    { code: 'var A_B = "world";' },
    { code: 'var A_B = `world`;' },
    { code: 'var a = {["A_B"]: "hello world"};' },
    { code: 'var a = {[A_B]: "hello world"};' },
    { code: 'var a = {A_B: "hello world"};' },
    { code: 'var a = {foo: "FOO"};' },
    { code: 'var a = {[`A_B`]: `hello world`};' },
    { code: 'var a = {[A_B]: `hello world`};' },
    { code: 'var a = {A_B: `hello world`};' },
    { code: 'var a = {foo: `FOO`};' },
    { code: 'class Form extends Component { displayName = "FormContainer" };' },
    { code: 'class Form extends Component { displayName = `FormContainer` };' },
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
    { code: '<DIV foo={`bar`} />' },
    { code: '<DIV foo="bar" />' },
    { code: 'a + `b`' },
    {
      code: 'switch(a){ case `a`: var a =`b`; break; default: break;}',
    },
    { code: 'var a = {foo: `bar`};' },
    { code: '<img src="./image.png" alt="some-image" />' },
    { code: 'var a = {foo: "bar"};' },
    { code: 'const a = "foo";' },
    { code: 'export const a = "hello_string";' },
    { code: 'Error("hello")', options: [{ ignoreFunction: ['Error'] }] },
    {
      code: 'new Error("hello")',
      options: [{ ignoreFunction: ['Error'] }],
    },
    {
      code: 'hello("Hello")',
      options: [{ ignoreFunction: ['hello'] }],
    },
    {
      code: 'formatDate(date, "d LLL")',
      options: [{ ignoreFunction: ['formatDate'] }],
    },
    { code: '<div>&nbsp; </div>' },
    { code: "plural('hello')" },
    { code: "select('hello')" },
    { code: "<Plural value='Hello' one='2' other='Hello' /> " },
    { code: "<Select value='Hello' one='2' other='Hello' /> " },
    {
      code: `<Input
          {...restProps}
          autoComplete="off"
      />`,
    },
    {
      code:
        'const Wrapper = styled.a` cursor: pointer; ${(props) => props.isVisible && `visibility: visible;`}`',
    },
    {
      code:
        "const Wrapper = styled.a` cursor: pointer; ${(props) => props.isVisible && 'visibility: visible;'}`",
    },
    { code: `const test = { id: 'This is not localized' }` },
    {
      code: `const test = { text: 'This is not localized' }`,
      options: [{ ignoreProperty: ['text'] }],
    },
  ],

  invalid: [
    { code: "ItemRenderer.displayName = 'ItemRenderer'", errors },
    { code: "<Plural value='Hello' one='2' notOther='3' /> ", errors },
    { code: "<Select value='Hello' one='2' notOther='3' /> ", errors },
    { code: "<Plural notValue='Hello' one='2' other='3' /> ", errors },
    { code: "<Select notValue='Hello' one='2' other='3' /> ", errors },
    { code: '<div>hello &nbsp; </div>', errors },
    { code: 'const a = `Hello ${nice}`', errors },
    { code: 'export const a = `hello string`;', errors },
    { code: "const ge = 'Select tax code'", errors },
    { code: 'const a = `Foo`;', errors },
    { code: 'const a = call(`Ffo`);', errors },
    { code: 'var a = {foo: `Bar`};', errors },
    { code: 'const a = `a foo`;', options: [{ ignore: ['^foo'] }], errors },
    {
      code: 'class Form extends Component { property = `Something` };',
      errors,
    },
    // JSX
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
    // JSX
    { code: '<div>foo</div>', errors },
    { code: '<div>Foo</div>', errors },
    { code: '<div>FOO</div>', errors },
    { code: '<DIV foo="Bar" />', errors },
    { code: '<img src="./image.png" alt="some image" />', errors },
    { code: '<button aria-label="Close" type="button" />', errors },
    { code: `const test = { text: 'This is not localized' }`, errors },
    {
      code: `function getQueryPlaceholder(compact: boolean | undefined) {
        return compact || mobileMediaQuery.matches
            ? 'Search'
            : 'Search for accounts, merchants, and more...'
    }`,
      errors: [
        { messageId: 'default', data: { message } },
        { messageId: 'default', data: { message } },
      ],
    },
  ],
})

const jsxTester = new RuleTester({
  parser: TYPESCRIPT_ESLINT,
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
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
      code:
        '<Trans id="missingReceipts.subtitle" description={`Call to action on missing receipt banner`} />',
    },
  ],
  invalid: [
    {
      code: '<Component>Abc</Component>',
      errors,
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
      errors,
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
      errors: [
        { messageId: 'default', data: { message } },
        { messageId: 'default', data: { message } },
      ],
    },
  ],
})

const tsTester = new RuleTester({
  parser: TYPESCRIPT_ESLINT,
  parserOptions: {
    sourceType: 'module',
  },
})

tsTester.run('no-unlocalized-strings', rule, {
  valid: [
    { code: '<div className="hello"></div>', filename: 'a.tsx' },
    { code: '<div className={`hello`}></div>', filename: 'a.tsx' },
    { code: "var a: Element['nodeName']" },
    { code: "var a: Omit<T, 'af'>" },
    { code: `var a: 'abc' = 'abc'` },
    { code: `var a: 'abc' | 'name'  | undefined= 'abc'` },
    { code: "type T = {name: 'b'} ; var a: T =  {name: 'b'}" },
    { code: "function Button({ t= 'name'  }: {t: 'name'}){} " },
    { code: "type T ={t?:'name'|'abc'};function Button({t='name'}:T){}" },
    {
      code: `enum StepType {
        Address = 'Address'
      }`,
    },
  ],
  invalid: [
    { code: `var a = 'Hello guys'`, errors },
    {
      code: `<button className={styles.btn}>loading</button>`,
      filename: 'a.tsx',
      errors,
    },
    {
      code: `<button className={styles.btn}>Loading</button>`,
      filename: 'a.tsx',
      errors,
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
      errors: [
        { messageId: 'default', data: { message } },
        { messageId: 'default', data: { message } },
      ],
    },
  ],
})
