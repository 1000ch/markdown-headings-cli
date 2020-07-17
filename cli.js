#!/usr/bin/env node
const {promisify} = require('util');
const path = require('path');
const fs = require('fs');
const minimist = require('minimist');
const globby = require('globby');
const getStdin = require('get-stdin');
const markdownHeadings = require('markdown-headings');

const readFile = promisify(fs.readFile);

const getVersion = () => Promise.resolve(require('./package').version);

async function getHelp() {
  const buffer = await readFile(path.resolve(__dirname, 'usage.txt'));

  return buffer.toString();
}

async function getFiles(args) {
  const files = await globby(args, {nodir: true});

  return files.map(file => path.resolve(process.cwd(), file));
}

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: 'help',
    s: 'stdin',
    v: 'version'
  },
  boolean: [
    'help',
    'stdin',
    'version'
  ]
});

(async () => {
  if (argv.v || argv.version) {
    const version = await getVersion();
    console.log(version);
    process.exit(0);
  }

  if (argv.h || argv.help) {
    const help = await getHelp();
    console.log(help);
    process.exit(0);
  }

  if (argv.stdin) {
    const stdin = await getStdin();
    const headings = await markdownHeadings(stdin);
    console.log(headings.join('\n'));
    process.exit(0);
  }

  try {
    const files = await getFiles(argv._);
    const promises = files.map(async file => {
      const buffer = await readFile(file);
      const headings = await markdownHeadings(buffer);
      headings.unshift(path.basename(file));

      return headings;
    });

    const results = await Promise.all(promises);
    console.log([].concat(...results).join('\n'));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
