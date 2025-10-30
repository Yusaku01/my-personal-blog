import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const src400 = resolve(
    __dirname,
    '../node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-japanese-400-normal.woff2'
  );
  const src700 = resolve(
    __dirname,
    '../node_modules/@fontsource/zen-kaku-gothic-new/files/zen-kaku-gothic-new-japanese-700-normal.woff2'
  );
  const outDir = resolve(__dirname, '../public/fonts');
  const out400 = resolve(outDir, 'zen-kaku-gothic-new-jp-400.woff2');
  const out700 = resolve(outDir, 'zen-kaku-gothic-new-jp-700.woff2');

  await mkdir(outDir, { recursive: true });
  await copyFile(src400, out400);
  await copyFile(src700, out700);
  console.log('[fonts] Copied Zen Kaku Gothic New woff2 files to public/fonts');
}

main().catch((err) => {
  console.error('[fonts] Copy failed:', err.message || err);
  process.exit(1);
});
