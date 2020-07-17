const fs = require('fs');
const test = require('ava');
const execa = require('execa');
const pkg = require('./package');

const expected = [
  'readme.md',
  '# markdown-headings-cli',
  '## Install',
  '## Usage',
  '## License'
].join('\n');

test('outputs version', async t => {
  const {stdout} = await execa.node('./cli.js', ['-v']);

  t.is(stdout, pkg.version);
});

test('outputs usage', async t => {
  const {stdout} = await execa.node('./cli.js', ['-h']);
  const help = fs.readFileSync('./usage.txt', 'utf-8');

  t.is(stdout, help);
});

test('accepts markdown file', async t => {
  const {stdout} = await execa.node('./cli.js', ['./readme.md']);

  t.is(stdout, expected);
});
