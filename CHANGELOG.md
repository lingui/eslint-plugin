# Change Log

- fix: no-unlocalized-strings rule to correctly handle as const assertions in property values with ignoreNames (#92) (4048c4d)
- fix: no-unlocalized-strings rule to ignore default parameter values specified in ignoreNames (#91) (68b9052)

* fix(no-unlocalized-strings): ignore more cases (#84) (061ef0d)

- chore(deps): bump cross-spawn from 7.0.3 to 7.0.5 (#83) (f10feb9)
- chore(deps): bump @eslint/plugin-kit from 0.2.0 to 0.2.3 (#81) (297bcdd)
- feat(no-unlocalized-strings): remove default configuration (#78) (32c823c)
- feat(no-unlocalized-strings): add patterns for ignore functions (#77) (e249254)
- feat(no-unlocalized-strings): add ignoreVariable option + refactor options (#76) (a407d3d)

* fix: not listed dependency `@typescript-eslint/scope-manager` (#75) (0ded72c)
* feat(recommended-config): add lingui/no-expression-in-message (#74) (5430625)

- feat(no-unlocalized-strings): add regex patterns support (#70) (1c248a2)
- fix: no-single-variables-to-translate renamed to no-single-variable... (#69) (b048305)
- feat(no-expression-in-message): correctly handle {' '} in JSX, report for each found expression (#68) (e935e01)

## 0.5.0 (2024-10-15)

- feat(no-expression-in-message): check Trans component (#60) (3fcb131)
- feat: support msg and defineMessage in various rules (#61) (15a4d04)
- refactor: use more eslint features instead of custom implementations (#62) (c30ccc6)
- feat: support messages defined as MessageDescriptor (#63) (7952a56)
- feat(text-restrictions): apply rules only for translation messages support different Lingui signatures (#64) (de9637f)
- feat(no-unlocalized-strings): add strictAttribute option (#66) (a284b26)

## 0.4.0 (2024-10-11)

- ci: fix release workflow (#57) (27cd472)
- fix(no-unlocalized-strings): ignore Literals in computed MemberExpression (#56) (edb2bc1)
- fix(config): get rid of array in config export (#55) (3c6d349)
- fix(no-expression-in-message): add select and selectOrdinal to exclusion (#54) (89f5953)
- feat: allow calls to plural function in no-expression-in-message (#48) (7a8d062)
- docs(no-unlocalized-strings): more examples for valid cases (#52) (f99a709)
- fix(no-unlocalized-strings): `ignoreProperty` support MemberExpression assignments (#51) (1ecc912)
- feat: Eslint 9 + flat config support (#49) (b57329b)
- chore(deps): bump braces from 3.0.2 to 3.0.3 (#44) (0c80feb)

## 0.3.0 (2024-02-09)

- feat: respect lazy translation tags in no-single-variables-to-translate (#34) (3cb7b6a)
- ci: minor fixes for the release process (#27) (cb0e1d5)

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
