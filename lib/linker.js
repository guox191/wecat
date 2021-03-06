'use strict'

const fs = require('fs')
const path = require('path')
const co = require('co')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const Progress = require('progress')
const local = require('./local')
const config = require('./config')

function move(pkg, link) {
  const pkgPath = path.join(config.workdir, 'node_modules', pkg, link.path)
  const targetPath = path.join(config.root, link.filename)
  mkdirp.sync(path.join(targetPath, '..'))

  return new Promise((resolve, reject) => {
    const read = fs.createReadStream(pkgPath)
    const write = fs.createWriteStream(targetPath)
    const errorHandler = err => {
      read.destroy()
      write.end()
      reject(err)
    }
    read.on('error', errorHandler)
    write.on('error', errorHandler)
    write.on('close', () => {
      resolve()
    })
    read.pipe(write)
  })
}

module.exports = () => {
  const links = local.read().link
  const linkKeys = Object.keys(links)
  const linkLen = linkKeys.length
  const progress = new Progress(`${chalk.yellow.bold('Downloading')} ▐:bar▐ \
${chalk.red.bold(':percent')} :elapseds`, {
    complete: '▸',
    total: linkLen,
    width: 50,
  })
  return co(function* () {
    for (let i = 0; i < linkLen; i++) {
      const pkg = linkKeys[i]
      yield move(pkg, links[pkg])
      progress.tick()
    }
    console.log('Link Complete')
  }).catch(err => {
    console.log('Link failed\n', err)
  })
}

