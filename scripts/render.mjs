import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const routes = process.argv.slice(2);
const pages = routes.length ? routes : [
  'src/routes/kb/incidents/4471/+page.svx',
  'src/routes/kb/incidents/4471-review/+page.svx',
  'src/routes/kb/triage/dedupe/+page.svx',
  'src/routes/kb/decisions/0001-dedupe-by-subject/+page.svx',
  'src/routes/kb/+page.svx',
];
const vite = await createServer({
  root,
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  resolve: { alias: { '#lib': resolve(root, 'src/lib') } },
  server: { middlewareMode: true, hmr: false, watch: null },
  plugins: [
    svelte({
      extensions: ['.svelte', '.svx'],
      emitCss: false,
      preprocess: mdsvex({
        extensions: ['.svx'],
        layout: { runbook: resolve(root, 'src/lib/layouts/runbook.svelte') },
      }),
    }),
  ],
});

try {
  const { render } = await vite.ssrLoadModule('svelte/server');
  for (const page of pages) {
    const component = await vite.ssrLoadModule(`/${page}`);
    const rendered = render(component.default);
    const head = rendered.head.replace(/\/\*# sourceMappingURL=data:[\s\S]*?\*\//g, '');
    const output = resolve(
      root,
      'rendered',
      page.replace(/^src\/routes\//, '').replace(/\/\+page\.svx$/, '/index.html'),
    );
    await mkdir(dirname(output), { recursive: true });
    await writeFile(
      output,
      `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body>${rendered.body}</body></html>\n`,
    );
    console.log(`Rendered ${page} -> ${output}`);
  }
} finally {
  await vite.close();
}
