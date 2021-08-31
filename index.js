'use strict'

const yaml = require('js-yaml')
const fs = require('fs')

const formats = {
  json: JSON.parse,
  yaml: yaml.load,
  yml: yaml.load
}

const generators = [
  (name, fmt) => `/etc/${name}.${fmt}`,
  (name, fmt) => `${process.cwd()}/${name}.${fmt}`,
  (name, fmt) => `${process.cwd()}/config.${fmt}`
]

const pickExisting = paths => paths.filter(p => fs.existsSync(p))[0]

function launchWrapper (fncLike, config) {
  if (fncLike instanceof Promise) {
    fncLike.then(imported => launchWrapper(imported, config))
  } else if (typeof fncLike === 'function') {
    return fncLike(config)
  } else if (typeof fncLike.default === 'function') {
    return fncLike
  } else {
    throw new TypeError('bin-gen was passed non-function/non-import object. Pass it either an import() promise with a default function export, a function or an object with a .default function property')
  }
}

module.exports = (name, { validator: v, formats: f, yargsExtends: y, configNameGenerators: g }, init) => {
  const yargs = require('yargs')
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging'
    })
  const argv = (y ? y(yargs) : yargs).argv

  const files = Object.keys(f || formats).map(fmt => (g || generators).map(g => g(name, fmt))).reduce((a, b) => a.concat(b), [])

  const file = argv.config || process.env.CONFIG || pickExisting(files)
  if (!file) {
    const hints = [
      'setting the --config argument',
      'setting the CONFIG= env variable',
      ...files.map(file => `writing the config to ${file}`)
    ]

    const lf = '\n  - '

    throw new Error('No valid config file found! Try ' + lf + hints.join(lf))
  }

  const contents = String(fs.readFileSync(file))
  let parsed = (f || formats)[file.split('.').pop()](contents)

  if (v) {
    const { error, value } = v.validate(parsed)
    if (error) {
      throw error
    }

    parsed = value
  }

  const config = {}
  Object.assign(config, parsed)
  Object.assign(config, argv)

  launchWrapper(init, config)
}
