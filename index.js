'use strict'

const yaml = require('js-yaml')
const fs = require('fs')

const formats = {
  json: JSON.parse,
  yaml: yaml.safeLoad,
  yml: yaml.safeLoad
}

const pickExisting = (...paths) => paths.filter(p => fs.existsSync(p))[0]

module.exports = (name, { v, y }, init) => {
  const yargs = require('yargs') // eslint-disable-line
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging'
    })
  const argv = (y ? y(yargs) : yargs).argv

  const file = argv.config || process.env.CONFIG || pickExisting(...Object.keys(formats).map(fmt => `/etc/${name}.${fmt}`))
  if (!file) {
    throw new Error('No valid config file found! Try setting CONFIG= env variable or --config argument')
  }

  const contents = String(fs.readFileSync(file))
  const parsed = formats[file.split('.').pop()](contents)

  const config = {}
  Object.assign(config, parsed)
  Object.assign(config, argv)

  return init(config)
}
