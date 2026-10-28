import assert from 'node:assert/strict';
import test from 'node:test';
import { analyze } from './analyze.mjs';
import { causeOf, dayFirst } from '../src/lib/kb/causes.ts';
import { deskRef } from '../src/lib/kb/desk-ref.ts';

test('all unique incident reports are assigned exactly once', async () => {
  const result = await analyze();
  assert.equal(result.exportRows, 427);
  assert.equal(result.repeatedRows, 15);
  assert.equal(result.uniqueReports, 412);
  assert.deepEqual(result.groups.map(({ cause, count }) => [cause, count]), [
    ['parser', 379],
    ['hint', 33],
  ]);
  const ids = result.groups.flatMap((group) => group.reportIds);
  assert.equal(new Set(ids).size, 412);
  assert.equal(ids.length, 412);
});

test('tenant locale, form and channel control cause, not intake tag', () => {
  const tenant = { handle: 'test', name: 'Test', locale: 'de-DE', form: 'booking-v3' };
  assert.equal(dayFirst(tenant.locale), true);
  assert.equal(causeOf({ channel: 'form' }, tenant), 'hint');
  assert.equal(causeOf({ channel: 'app' }, tenant), 'parser');
  assert.equal(causeOf({ channel: 'email' }, tenant), 'parser');
  assert.equal(causeOf({ channel: 'form' }, { ...tenant, form: 'booking-v2' }), 'parser');
  assert.equal(causeOf({ channel: 'form' }, { ...tenant, locale: 'en-US' }), null);
  assert.equal(causeOf({ channel: 'form' }, undefined), null);
});

test('one-day descriptions remain explicit exceptions, not invented root causes', async () => {
  const result = await analyze();
  assert.deepEqual(result.oneDayReports.map((report) => report.id), [
    'R-41202', 'R-41209', 'R-41236', 'R-41344', 'R-41620',
  ]);
  assert.ok(result.oneDayReports.every((report) => report.assignedCause === 'parser'));
});

test('same subject can conceal different causes', async () => {
  const result = await analyze();
  assert.equal(result.subjectCounterexample.sameSubject, true);
  assert.equal(result.subjectCounterexample.sameCause, false);
});

test('a desk reference derives from the exact signature', () => {
  assert.equal(deskRef('copilot-mega-s01e03'), deskRef(' copilot-mega-s01e03 '));
  assert.match(deskRef('copilot-mega-s01e03'), /^DR-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
});
