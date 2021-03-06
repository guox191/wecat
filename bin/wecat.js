#!/usr/bin/env node

const yargs = require('yargs')
const co = require('co')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const local = require('../lib/local')
const linker = require('../lib/linker')
const fetcher = require('../lib/fetcher')

updateNotifier({pkg}).notify()

function createHandler(args) {
  if (!local.checkExist()) {
    console.log('No wecat.json file')
    return
  }
  local.setConfig()
  const entry = args._[0]
  switch (entry) {
    case 'i':
    case 'install':
      co(function* () {
        yield fetcher()
        yield linker()
      })
      break
    case 'link':
      linker()
      break
    case 'download':
      fetcher()
      break
    default:
      break
  }
}

function initHandler() {
  if (local.checkExist()) {
    console.log('You have done!')
  } else {
    local.init()
    console.log('Done!')
  }
}

/* eslint no-unused-expressions: 0 */
yargs
  .usage('wecat [command] [options]')
  .command(['init'], 'Initalize wecat project', () => {}, initHandler)
  .command(['install', 'i'], 'Install all dependencies', () => {}, createHandler)
  .command(['link'], 'Link node_modules files', () => {}, createHandler)
  .command(['download'], 'Download targets', () => {}, createHandler)
  .version(pkg.version)
  .alias('version', 'V')
  .alias('help', 'H')
  .help()
  .argv

if (!yargs.argv._[0]) {
  yargs.showHelp()
}

