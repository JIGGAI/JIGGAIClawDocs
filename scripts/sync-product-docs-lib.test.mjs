import test from 'node:test';
import assert from 'node:assert/strict';

import {
  descriptionFromContent,
  stripDuplicateIntro,
  titleFromContent
} from './sync-product-docs-lib.mjs';

test('stripDuplicateIntro removes duplicated H1 + lede paragraph when derived from them', () => {
  const src = `# Hello World\n\nThis is the first paragraph that should become the description.\n\n## Next\nBody.`;
  const title = titleFromContent('HELLO.md', src);
  const desc = descriptionFromContent(src);

  assert.equal(title, 'Hello World');
  assert.equal(desc, 'This is the first paragraph that should become the description.'.slice(0, 180));

  const body = stripDuplicateIntro(src, title, desc);
  assert.ok(!body.includes('# Hello World'));
  assert.ok(!body.startsWith('This is the first paragraph'));
  assert.ok(body.includes('## Next'));
});

test('stripDuplicateIntro preserves non-matching H1', () => {
  const src = `# Different\n\nPara.\n`;
  const body = stripDuplicateIntro(src, 'Title From Elsewhere', 'Para.');
  assert.ok(body.startsWith('# Different'));
});

test('descriptionFromContent uses multi-line paragraphs', () => {
  const src = `# T\n\nLine one\nline two\n\nMore`;
  const desc = descriptionFromContent(src);
  assert.equal(desc, 'Line one line two');
});
