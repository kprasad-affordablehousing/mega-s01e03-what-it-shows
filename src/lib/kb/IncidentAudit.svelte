<script lang="ts">
  import exported from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { causeOf, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  const reports = uniqueById(exported as Report[]).filter((r) => r.mergedInto === 4471);
  const repeated = exported.length - uniqueById(exported as Report[]).length;
  const exceptions = reports.filter((r) => notes.oneDayMove.includes(r.id));
  const mergedByDay = reports.reduce<Record<string, number>>((days, r) => {
    if (r.mergedAt) {
      const day = r.mergedAt.slice(0, 10);
      days[day] = (days[day] ?? 0) + 1;
    }
    return days;
  }, {});
  const peak = Object.entries(mergedByDay).sort((a, b) => b[1] - a[1])[0];
</script>

<p>
  The export has <strong>{exported.length}</strong> rows, but
  <strong>{reports.length}</strong> unique reports in support incident #4471.
  Remove <strong>{repeated}</strong> overlapping export rows by report ID, not by subject or body.
</p>

{#if peak}
  <p>
    The largest merge day was <strong>{peak[0]}</strong>:
    <strong>{peak[1]}</strong> reports were filed into the ticket that day.
    That is the merge date, not the date all those problems began.
  </p>
{/if}

<h3>Descriptions that need follow-up</h3>
<p>
  The desk noted <strong>{exceptions.length}</strong> reports as one-day moves.
  The exported tenant/channel classifier still files them under the causes below.
  They are included in those counts, not counted again as a proved third defect.
</p>

<table>
  <thead><tr><th>report</th><th>filed cause</th><th>reporter's description</th></tr></thead>
  <tbody>
    {#each exceptions as report (report.id)}
      <tr>
        <td><code>{report.id}</code></td>
        <td><code>{causeOf(report, tenantOf(report)) ?? 'unplaced'}</code></td>
        <td>{report.body}</td>
      </tr>
    {/each}
  </tbody>
</table>
