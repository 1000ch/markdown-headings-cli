import {promises as fs} from 'node:fs';
import test from 'ava';
import {execa} from 'execa';

const expected = [
  'readme.md',
  '# markdown-headings-cli GitHub Actions Status',
  '## Install',
  '## Usage',
  '## License',
].join('\n');

test('outputs version', async t => {
  const {stdout} = await execa('./cli.js', ['-v']);
  const {version} = JSON.parse(await fs.readFile('package.json', 'utf8'));

  t.is(stdout, version);
});

test('outputs usage', async t => {
  const {stdout} = await execa('./cli.js', ['-h']);
  const help = await fs.readFile('usage.txt', 'utf-8');

  t.is(stdout, help);
});

test('accepts markdown file', async t => {
  const {stdout} = await execa('./cli.js', ['./readme.md']);

  t.is(stdout, expected);
});
