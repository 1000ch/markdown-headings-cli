#!/usr/bin/env node
import {promises as fs} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import minimist from 'minimist';
import {globby} from 'globby';
import getStdin from 'get-stdin';
import markdownHeadings from 'markdown-headings';

async function getVersion() {
  const {version} = JSON.parse(await fs.readFile('package.json', 'utf8'));

  return version;
}

async function getHelp() {
  const buffer = await fs.readFile('usage.txt', 'utf8');

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
    v: 'version',
  },
  boolean: [
    'help',
    'stdin',
    'version',
  ],
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
      const buffer = await fs.readFile(file);
      const headings = await markdownHeadings(buffer);
      headings.unshift(path.basename(file));

      return headings;
    });

    const results = await Promise.all(promises);
    console.log(results.flat().join('\n'));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
