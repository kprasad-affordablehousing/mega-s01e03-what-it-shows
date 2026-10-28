import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

const load = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

test('the signed review is genuinely rendered with counts, chart, links and CSS', async () => {
  const source = await load('src/routes/kb/incidents/4471-review/+page.svx');
  const signature = source.match(/^signature: '([^']+)'$/m)?.[1];
  assert.ok(signature, 'the page must carry its assigned signature');
  const html = await load('rendered/kb/incidents/4471-review/index.html');
  assert.match(html, /<td\b[^>]*>379<\/td>/);
  assert.match(html, /<td\b[^>]*>33<\/td>/);
  assert.match(html, /<strong>427<\/strong>/);
  assert.match(html, /<strong>412<\/strong>/);
  assert.match(html, /<strong>15<\/strong>/);
  assert.match(html, /<strong>5<\/strong>/);
  assert.equal((html.match(/<rect /g) ?? []).length, 54);
  assert.ok(html.includes('https://github.com/kprasad-affordablehousing/mega-s01e03-what-it-shows/issues/1'));
  assert.ok(html.includes('https://github.com/kprasad-affordablehousing/mega-s01e03-what-it-shows/issues/2'));
  assert.ok(html.includes(deskRef(signature)));
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((match) => match[1]).join('');
  assert.ok(styles.length > 1000, 'component and layout CSS must be embedded');
  assert.ok(!html.includes('no desk ref:'));
  assert.ok(!html.includes('<RenderStamp'));
  assert.ok(!html.includes('sourceMappingURL'));
  assert.ok(!html.includes('C:/Users/'));
});

test('the KB index discovers the new page and old guidance is visibly stale', async () => {
  const index = await load('rendered/kb/index.html');
  assert.ok(index.includes('href="/kb/incidents/4471-review"'));
  const triage = await load('rendered/kb/triage/dedupe/index.html');
  const decision = await load('rendered/kb/decisions/0001-dedupe-by-subject/index.html');
  assert.ok(triage.includes('Check it against the live views'));
  assert.ok(decision.includes('Check it against the live views'));
});
