import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  causeOf,
  groupByCause,
  sameCause,
  uniqueById,
} from '../src/lib/kb/causes.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = async (file) =>
  JSON.parse(await readFile(resolve(root, file), 'utf8'));

export async function analyze() {
  const exported = await readJson('src/lib/data/reports-4471.json');
  const notes = await readJson('src/lib/data/desk-notes.json');
  const tenantFiles = await readdir(resolve(root, 'src/lib/data/tenants'));
  const tenants = await Promise.all(
    tenantFiles.map((file) => readJson(`src/lib/data/tenants/${file}`)),
  );
  const byHandle = new Map(tenants.map((tenant) => [tenant.handle, tenant]));
  const tenantOf = (report) => byHandle.get(report.tenant);
  const reports = uniqueById(exported).filter(
    (report) => report.mergedInto === 4471,
  );
  const groups = groupByCause(reports, tenantOf);
  const countBy = (key) =>
    reports.reduce((counts, report) => {
      const value = key(report);
      counts[value] = (counts[value] ?? 0) + 1;
      return counts;
    }, {});
  const mergedByDay = countBy((report) => report.mergedAt.slice(0, 10));
  const busiestMergeDay = Object.entries(mergedByDay).sort(
    (a, b) => b[1] - a[1],
  )[0];
  return {
    exportRows: exported.length,
    uniqueReports: reports.length,
    repeatedRows: exported.length - uniqueById(exported).length,
    groups: groups.map((group) => ({
      cause: group.cause,
      count: group.reports.length,
      reportIds: group.reports.map((report) => report.id).sort(),
      taggedAs: group.taggedAs,
      tenants: group.tenants,
      firstSeen: group.firstSeen,
      lastSeen: group.lastSeen,
      examples: group.reports.slice(0, 3),
    })),
    oneDayReports: reports
      .filter((report) => notes.oneDayMove.includes(report.id))
      .map((report) => ({
        ...report,
        assignedCause: causeOf(report, tenantOf(report)),
      })),
    receivedByMonth: countBy((report) => report.receivedAt.slice(0, 7)),
    mergedByMonth: countBy((report) => report.mergedAt.slice(0, 7)),
    busiestMergeDay,
    subjectCounterexample: (() => {
      const a = { tenant: 'alder.physio', channel: 'form', subject: 'Booking on the wrong date' };
      const b = { ...a, channel: 'app' };
      return {
        a,
        b,
        sameSubject: a.subject === b.subject,
        sameCause: sameCause(a, tenantOf(a), b, tenantOf(b)),
      };
    })(),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await analyze();
  await writeFile(
    resolve(root, 'analysis.json'),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(JSON.stringify({
    ...result,
    groups: result.groups.map(({ reportIds, examples, ...group }) => group),
    oneDayReports: result.oneDayReports.map(({ id, assignedCause }) => ({ id, assignedCause })),
  }, null, 2));
}
