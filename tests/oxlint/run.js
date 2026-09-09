/**
 * Oxlint compatibility check.
 *
 * Runs the built plugin (`lib/`) as an Oxlint JS plugin over the fixtures and asserts that:
 *  - the plugin loads without "Error running JS plugin" failures,
 *  - every rule reports at least once on `fixtures/invalid.tsx`,
 *  - `fixtures/valid.tsx` produces no diagnostics.
 */
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const root = path.resolve(__dirname, '..', '..')
const configPath = path.join(__dirname, '.oxlintrc.json')
const fixturesDir = path.join(__dirname, 'fixtures')
const oxlintPackage = require.resolve('oxlint/package.json')
const oxlintBin = path.join(path.dirname(oxlintPackage), require(oxlintPackage).bin.oxlint)
const oxlintVersion = require(oxlintPackage).version

let plugin
try {
  plugin = require(path.join(root, 'lib', 'index.js'))
} catch (error) {
  fail(`Could not load lib/index.js. Run \`yarn build\` first.\n${error.message}`)
}
const ruleNames = Object.keys(plugin.rules)

console.log(`Running oxlint@${oxlintVersion} with ${ruleNames.length} lingui rules...`)

// `-A all` silences oxlint's built-in rules so only plugin diagnostics are reported.
const result = spawnSync(
  process.execPath,
  [oxlintBin, '-c', configPath, '-A', 'all', '--format', 'json', fixturesDir],
  { cwd: root, encoding: 'utf8' },
)

if (result.error) fail(`Failed to start oxlint: ${result.error.message}`)
// 0 = no errors, 1 = lint errors reported. Anything else is a crash.
if (result.status !== 0 && result.status !== 1) {
  fail(`oxlint exited with code ${result.status}\n${result.stdout}\n${result.stderr}`)
}

let diagnostics
try {
  diagnostics = JSON.parse(result.stdout).diagnostics
} catch {
  fail(`Could not parse oxlint JSON output:\n${result.stdout}\n${result.stderr}`)
}

const problems = []
const reported = { 'invalid.tsx': new Set(), 'valid.tsx': new Set() }

for (const diagnostic of diagnostics) {
  const file = path.basename(diagnostic.filename)
  const match = /^lingui\((.+)\)$/.exec(diagnostic.code)
  if (!match) {
    problems.push(`Unexpected diagnostic in ${file}: ${diagnostic.message.split('\n').join(' | ')}`)
    continue
  }
  if (!(file in reported)) reported[file] = new Set()
  reported[file].add(match[1])
}

const missing = ruleNames.filter((rule) => !reported['invalid.tsx'].has(rule))
if (missing.length > 0) {
  problems.push(`Rules not reported on fixtures/invalid.tsx: ${missing.join(', ')}`)
}
const unknown = [...reported['invalid.tsx']].filter((rule) => !ruleNames.includes(rule))
if (unknown.length > 0) {
  problems.push(`Unknown rules reported on fixtures/invalid.tsx: ${unknown.join(', ')}`)
}
if (reported['valid.tsx'].size > 0) {
  problems.push(`fixtures/valid.tsx should be clean, got: ${[...reported['valid.tsx']].join(', ')}`)
}

if (problems.length > 0) fail(problems.join('\n'))

console.log(
  `OK: all ${ruleNames.length} rules reported under oxlint@${oxlintVersion}, valid fixture is clean.`,
)

function fail(message) {
  console.error(`\noxlint compatibility check failed:\n${message}`)
  process.exit(1)
}
