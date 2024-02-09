# Change Log

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
