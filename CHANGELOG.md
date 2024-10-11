# Change Log

- ci: fix release workflow (#57) (27cd472)
- fix(no-unlocalized-strings): ignore Literals in computed MemberExpression (#56) (edb2bc1)
- fix(config): get rid of array in config export (#55) (3c6d349)
- fix(no-expression-in-message): add select and selectOrdinal to exclusion (#54) (89f5953)
- feat: allow calls to plural function in no-expression-in-message (#48) (7a8d062)
- docs(no-unlocalized-strings): more examples for valid cases (#52) (f99a709)
- fix(no-unlocalized-strings): `ignoreProperty` support MemberExpression assignments (#51) (1ecc912)
- feat: Eslint 9 + flat config support (#49) (b57329b)
- chore(deps): bump braces from 3.0.2 to 3.0.3 (#44) (0c80feb)

* feat: respect lazy translation tags in no-single-variables-to-translate (#34) (3cb7b6a)
* ci: minor fixes for the release process (#27) (cb0e1d5)

## 0.2.2 (2023-12-20)

- fix: ban top level t() calls aside from t`` calls (#26) (5ca48ad)
- chore(deps): bump semver from 6.3.0 to 6.3.1 (#24) (7c588c4)
- chore(deps): bump @babel/traverse from 7.22.8 to 7.23.5 (#23) (7c3bd2a)

## 0.2.1 (2023-12-08)

- fix(no-unlocalized-strings): utilize ignoreFunction which is used as CallExpression (#21) (e84de6e)
- fix(no-unlocalized-strings): utilize TS enums when if parserServices.program is empty (#22) (5078ea0)

## 0.2.0 (2023-10-06)

- feat(no-unlocalized-strings): add ignoreProperty option (#20) (a4d7683)

## 0.1.2 (2023-09-28)

- test: add a new test case for the ignoreFunction option (#19) (3b32de7)
- fix: update no-unlocalized to properly utilize ignoreFunction option (#16) (5e95b3e)

## 0.1.1 (2023-09-11)

- ci: improve the release process (#15) (46077d3)
- chore: change nodejs engine requirement (#14) (4cb2f1e)

## 0.1.0 (2023-09-04)

Initial release
