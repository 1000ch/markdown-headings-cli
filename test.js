const test = require('ava');
const execa = require('execa');

const expected = [
  'readme.md',
  '# markdown-headings-cli',
  '## Install',
  '## Usage',
  '## License'
].join('\n');

test('accepts markdown file', async t => {
  const {stdout} = await execa.node('./cli.js', ['./readme.md']);

  t.is(stdout, expected);
});
