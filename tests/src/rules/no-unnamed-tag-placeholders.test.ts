import { rule, name } from '../../../src/rules/no-unnamed-tag-placeholders'
import { RuleTester } from '@typescript-eslint/rule-tester'

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
})

ruleTester.run(name, rule, {
  valid: [
    {
      name: 'Plain text inside Trans without tags',
      code: '<Trans>Hello world</Trans>',
    },
    {
      name: 'Tag matching jsxPlaceholderDefaults (single tag)',
      code: '<Trans>Click <a href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderDefaults: { a: 'link' } }],
    },
    {
      name: 'Multiple tags matching jsxPlaceholderDefaults',
      code: '<Trans>Click <a href="/home">here</a> and <em>this</em> and <strong>that</strong></Trans>',
      options: [
        {
          jsxPlaceholderDefaults: {
            a: 'link',
            em: 'emphasis',
            strong: 'bold',
          },
        },
      ],
    },
    {
      name: 'Tag matching jsxPlaceholderDefaults as an array',
      code: '<Trans>Click <a href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderDefaults: ['a', 'em'] }],
    },
    {
      name: 'Tag using jsxPlaceholderAttribute with string literal',
      code: '<Trans>Click <a _t="myLink" href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Custom component using jsxPlaceholderAttribute',
      code: '<Trans>Welcome <Link _t="nav_link" to="/profile">Profile</Link></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Tag using jsxPlaceholderAttribute with expression container',
      code: '<Trans>Click <a _t={"custom_link"} href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Tag using jsxPlaceholderAttribute with variable expression',
      code: '<Trans>Click <a _t={linkPlaceholder} href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Mixed: default tag and custom attribute tag',
      code: '<Trans>Click <a>here</a> or <Link _t="custom_link">there</Link></Trans>',
      options: [
        {
          jsxPlaceholderAttribute: '_t',
          jsxPlaceholderDefaults: { a: 'link' },
        },
      ],
    },
    {
      name: 'Tag matching defaults with explicit attribute (attribute takes priority)',
      code: '<Trans>Click <a _t="custom_link" href="/home">here</a></Trans>',
      options: [
        {
          jsxPlaceholderAttribute: '_t',
          jsxPlaceholderDefaults: { a: 'link' },
        },
      ],
    },
    {
      name: 'Member expression component matching defaults',
      code: '<Trans>Click <UI.Button>Click</UI.Button></Trans>',
      options: [{ jsxPlaceholderDefaults: { 'UI.Button': 'button' } }],
    },
    {
      name: 'Member expression component using attribute',
      code: '<Trans>Click <UI.Button _t="btn">Click</UI.Button></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Namespaced tag using placeholder attribute',
      code: '<Trans><svg:path _t="path" /></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Element passed as prop value inside attribute is ignored',
      code: '<Trans>Click <Button _t="btn" icon={<Icon />}>Submit</Button></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Element in Trans render prop is ignored',
      code: '<Trans render={<p className="lead" />}>Hello <a _t="link">world</a></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Nested elements where all have valid placeholders',
      code: '<Trans><p _t="intro">Click <a _t="link">here</a> to <strong>read</strong></p></Trans>',
      options: [
        {
          jsxPlaceholderAttribute: '_t',
          jsxPlaceholderDefaults: { strong: 'bold' },
        },
      ],
    },
    {
      name: 'JSX Fragment inside Trans containing valid tags',
      code: '<Trans><><a _t="link">Click</a></></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'JSX elements outside Trans are ignored',
      code: '<div><a href="/">Regular JSX</a><Button>Submit</Button></div>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Lingui ICU components inside Trans are ignored',
      code: '<Trans>Count: <Plural value={count} one="# book" other="# books" /></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    // Plural component
    {
      name: 'Plural component with plain text branches',
      code: '<Plural value={count} one="# book" other="# books" />',
    },
    {
      name: 'Plural component with tag matching jsxPlaceholderDefaults',
      code: '<Plural value={count} one={<a href="/book"># book</a>} other={<a href="/books"># books</a>} />',
      options: [{ jsxPlaceholderDefaults: { a: 'link' } }],
    },
    {
      name: 'Plural component with jsxPlaceholderAttribute',
      code: '<Plural value={count} one={<a _t="book_link" href="/book"># book</a>} other={<a _t="books_link" href="/books"># books</a>} />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Plural component with render prop containing element is ignored',
      code: '<Plural render={<p className="count" />} value={count} one="# book" other="# books" />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Plural component nested inside Trans with valid placeholder attributes',
      code: '<Trans>Count: <Plural value={count} one={<a _t="book_link"># book</a>} other={<a _t="books_link"># books</a>} /></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    // Select component
    {
      name: 'Select component with plain text branches',
      code: '<Select value={gender} male="He" female="She" other="They" />',
    },
    {
      name: 'Select component with tag matching jsxPlaceholderDefaults',
      code: '<Select value={gender} male={<b>He</b>} female={<b>She</b>} other={<b>They</b>} />',
      options: [{ jsxPlaceholderDefaults: { b: 'bold' } }],
    },
    {
      name: 'Select component with jsxPlaceholderAttribute',
      code: '<Select value={gender} male={<Link _t="male_link" to="/male">He</Link>} female={<Link _t="female_link" to="/female">She</Link>} other="They" />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'Select component nested inside Trans with valid placeholder attributes',
      code: '<Trans>User: <Select value={gender} male={<strong _t="m">He</strong>} female={<strong _t="f">She</strong>} other="They" /></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    // SelectOrdinal component
    {
      name: 'SelectOrdinal component with plain text branches',
      code: '<SelectOrdinal value={count} one="#st" two="#nd" few="#rd" other="#th" />',
    },
    {
      name: 'SelectOrdinal component with tag matching jsxPlaceholderDefaults',
      code: '<SelectOrdinal value={count} one={<b>#st</b>} two={<b>#nd</b>} few={<b>#rd</b>} other={<b>#th</b>} />',
      options: [{ jsxPlaceholderDefaults: { b: 'bold' } }],
    },
    {
      name: 'SelectOrdinal component with jsxPlaceholderAttribute',
      code: '<SelectOrdinal value={count} one={<span _t="st">#st</span>} other={<span _t="th">#th</span>} />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
    {
      name: 'SelectOrdinal component nested inside Trans with valid placeholder attributes',
      code: '<Trans>You came in <SelectOrdinal value={count} one={<strong _t="st">#st</strong>} other={<strong _t="th">#th</strong>} /> place</Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
    },
  ],
  invalid: [
    {
      name: 'Tag inside Trans with default options (no config)',
      code: '<Trans>Click <a href="/home">here</a></Trans>',
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Tag inside Trans not matching jsxPlaceholderDefaults',
      code: '<Trans>Click <a href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderDefaults: { em: 'emphasis' } }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Custom component inside Trans missing jsxPlaceholderAttribute',
      code: '<Trans>Welcome <Link to="/profile">Profile</Link></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'Link' },
        },
      ],
    },
    {
      name: 'Multiple unassigned tags inside single Trans',
      code: '<Trans>Click <a href="/">here</a> or <button>submit</button></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
        {
          messageId: 'default',
          data: { name: 'button' },
        },
      ],
    },
    {
      name: 'Tag with empty string placeholder attribute',
      code: '<Trans>Click <a _t="" href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Tag with empty string expression in placeholder attribute',
      code: '<Trans>Click <a _t={""} href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Tag with boolean shorthand placeholder attribute',
      code: '<Trans>Click <a _t href="/home">here</a></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Nested unassigned tag inside an assigned parent tag',
      code: '<Trans><p _t="para">Click <a href="/home">here</a></p></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Member expression component without placeholder',
      code: '<Trans>Click <UI.Button>Click</UI.Button></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'UI.Button' },
        },
      ],
    },
    {
      name: 'Tag inside JSX Fragment within Trans without placeholder',
      code: '<Trans><><a href="/home">Click</a></></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    // Plural component invalid cases
    {
      name: 'Tag inside Plural with default options (no config)',
      code: '<Plural value={count} one={<a href="/book"># book</a>} other="# books" />',
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Tag inside Plural not matching jsxPlaceholderDefaults',
      code: '<Plural value={count} one={<a href="/book"># book</a>} other="# books" />',
      options: [{ jsxPlaceholderDefaults: { em: 'emphasis' } }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Custom component inside Plural missing jsxPlaceholderAttribute',
      code: '<Plural value={count} one={<Link to="/book"># book</Link>} other="# books" />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'Link' },
        },
      ],
    },
    {
      name: 'Multiple unassigned tags across Plural branches',
      code: '<Plural value={count} one={<a href="/book"># book</a>} other={<button># books</button>} />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
        {
          messageId: 'default',
          data: { name: 'button' },
        },
      ],
    },
    {
      name: 'Tag inside Plural nested inside Trans without placeholder',
      code: '<Trans>Count: <Plural value={count} one={<a href="/book"># book</a>} other="# books" /></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    {
      name: 'Tag inside Plural with empty string placeholder attribute',
      code: '<Plural value={count} one={<a _t="" href="/book"># book</a>} other="# books" />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    // Select component invalid cases
    {
      name: 'Tag inside Select with default options (no config)',
      code: '<Select value={gender} male={<b>He</b>} female={<b>She</b>} other="They" />',
      errors: [
        {
          messageId: 'default',
          data: { name: 'b' },
        },
        {
          messageId: 'default',
          data: { name: 'b' },
        },
      ],
    },
    {
      name: 'Custom component inside Select missing jsxPlaceholderAttribute',
      code: '<Select value={gender} male={<UserLink to="/m">He</UserLink>} other="They" />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'UserLink' },
        },
      ],
    },
    {
      name: 'Member expression component inside Select without placeholder',
      code: '<Select value={status} active={<UI.Badge>Active</UI.Badge>} other="Unknown" />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'UI.Badge' },
        },
      ],
    },
    {
      name: 'Tag inside Select nested inside Trans without placeholder',
      code: '<Trans><Select value={gender} male={<a>He</a>} other="They" /></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'a' },
        },
      ],
    },
    // SelectOrdinal component invalid cases
    {
      name: 'Tag inside SelectOrdinal with default options (no config)',
      code: '<SelectOrdinal value={count} one={<b>#st</b>} other={<strong>#th</strong>} />',
      errors: [
        {
          messageId: 'default',
          data: { name: 'b' },
        },
        {
          messageId: 'default',
          data: { name: 'strong' },
        },
      ],
    },
    {
      name: 'Custom component inside SelectOrdinal missing jsxPlaceholderAttribute',
      code: '<SelectOrdinal value={count} one={<Medal place={1}>#st</Medal>} other="#th" />',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'Medal' },
        },
      ],
    },
    {
      name: 'Tag inside SelectOrdinal nested inside Trans without placeholder',
      code: '<Trans><SelectOrdinal value={count} one={<em>#st</em>} other="#th" /></Trans>',
      options: [{ jsxPlaceholderAttribute: '_t' }],
      errors: [
        {
          messageId: 'default',
          data: { name: 'em' },
        },
      ],
    },
  ],
})
