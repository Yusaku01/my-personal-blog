import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const engines = [
  { name: 'Current', url: 'http://127.0.0.1:4331/blog/', kind: 'current' },
  { name: 'Jev', url: 'http://127.0.0.1:4332/search-lab/', kind: 'lab' },
  { name: 'Cloudflare AI Search', url: 'http://127.0.0.1:4333/search-lab/', kind: 'lab' },
  { name: 'Orama', url: 'http://127.0.0.1:4334/search-lab/', kind: 'lab' },
  { name: 'Pagefind', url: 'http://127.0.0.1:4335/search-lab/', kind: 'lab' },
  { name: 'Fuse.js', url: 'http://127.0.0.1:4336/search-lab/', kind: 'lab' },
];

const terms = [
  'Web Worker',
  'コンテナクエリ',
  'プリフェッチ',
  '翻訳',
  'キャッシュ',
  'View transitions',
  'CSS変数',
  'mise',
  'Lukurauha',
  'ルーティング',
];
const naturalQueries = [
  'Astro のページを事前に読み込む方法',
  'ブログ記事を速くビルドしたい',
  '読書アプリを作った話',
];
const intentGold = {
  'Astro のページを事前に読み込む方法': [
    '/blog/astro-island-prefetch',
    '/blog/astro-nextjs-prefetch-comparison',
    'https://zenn.dev/saku2323/articles/about-astro-prefetch',
  ],
  ブログ記事を速くビルドしたい: ['/blog/learn-cachedir-astro'],
  読書アプリを作った話: ['/blog/lukurauha'],
};
const repetitions = 3;
const outputUrl = new URL('../benchmarks/search-lab/results.json', import.meta.url);

const mean = (values) => values.reduce((total, value) => total + value, 0) / values.length;
const percentile = (values, fraction) => {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.ceil(fraction * ordered.length) - 1];
};
const round = (value) => Math.round(value * 10) / 10;
const roundMetric = (value) => Math.round(value * 1000) / 1000;

const runQuery = (page, query, kind) =>
  page.evaluate(
    ({ query, kind }) =>
      new Promise((resolve, reject) => {
        const current = kind === 'current';
        const form = document.querySelector(
          current ? '[data-blog-search-form]' : '[data-search-lab-form]'
        );
        const input = document.querySelector(
          current ? '[data-blog-search-input]' : '[data-search-lab-input]'
        );
        if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement)) {
          reject(new Error('Search form unavailable'));
          return;
        }
        const readResults = () =>
          Array.from(
            document.querySelectorAll(
              current ? '[data-post-wrapper]:not(.hidden)' : '[data-search-lab-card]:not([hidden])'
            )
          ).map((item) => item.getAttribute('data-post-url'));
        input.value = query;
        const started = performance.now();
        if (current) {
          form.requestSubmit();
          resolve({ ms: performance.now() - started, results: readResults() });
          return;
        }
        const status = document.querySelector('[data-search-lab-status]');
        if (!status) {
          reject(new Error('Search status unavailable'));
          return;
        }
        const timeout = setTimeout(() => {
          observer.disconnect();
          reject(new Error(`Search timed out: ${query}`));
        }, 30000);
        const observer = new MutationObserver(() => {
          const message = status.textContent ?? '';
          if (!/(所要|応答|検索できませんでした)/.test(message)) return;
          clearTimeout(timeout);
          observer.disconnect();
          resolve({
            ms: performance.now() - started,
            results: readResults(),
            error: message.includes('検索できませんでした') ? message : undefined,
          });
        });
        observer.observe(status, { childList: true, subtree: true, characterData: true });
        form.requestSubmit();
      }),
    { query, kind }
  );

const indexResponse = await fetch('http://127.0.0.1:4331/search-index.json');
if (!indexResponse.ok) throw new Error(`Baseline index unavailable: ${indexResponse.status}`);
const documents = await indexResponse.json();
const truth = Object.fromEntries(
  terms.map((term) => [
    term,
    documents
      .filter((document) => document.searchText.includes(term.normalize('NFKC').toLowerCase()))
      .map((document) => document.url),
  ])
);
if (Object.values(truth).some((urls) => !urls.length))
  throw new Error('Term without literal match');

const browser = await chromium.launch({ headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  repetitions,
  terms,
  naturalQueries,
  truth,
  intentGold,
  engines: [],
};
try {
  for (const engine of engines) {
    const page = await browser.newPage();
    await page.goto(engine.url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(
      (kind) =>
        kind === 'current'
          ? Boolean(window.__blogSearchCleanup) &&
            !document.querySelector('[data-blog-search-input]')?.disabled
          : Boolean(window.__searchLabInstalled),
      engine.kind,
      { timeout: 30000 }
    );

    const cold = await runQuery(page, 'mise', engine.kind);
    const cases = [];
    for (const query of [...terms, ...naturalQueries]) {
      const runs = [];
      for (let index = 0; index < repetitions; index++) {
        runs.push(await runQuery(page, query, engine.kind));
      }
      cases.push({ query, runs });
    }
    await page.close();

    const durations = cases.flatMap((item) => item.runs.map((run) => run.ms));
    const termCases = cases.filter((item) => terms.includes(item.query));
    const naturalCases = cases.filter((item) => naturalQueries.includes(item.query));
    const relevantTop3 = termCases.reduce((total, item) => {
      const expected = new Set(truth[item.query]);
      return (
        total +
        item.runs.reduce(
          (hits, run) => hits + run.results.slice(0, 3).filter((url) => expected.has(url)).length,
          0
        )
      );
    }, 0);
    const top3Denominator = termCases.reduce(
      (total, item) => total + repetitions * Math.min(3, truth[item.query].length),
      0
    );
    const reciprocalRanks = termCases.flatMap((item) => {
      const expected = new Set(truth[item.query]);
      return item.runs.map((run) => {
        const rank = run.results.findIndex((url) => expected.has(url));
        return rank < 0 ? 0 : 1 / (rank + 1);
      });
    });
    const naturalRanks = naturalCases.flatMap((item) => {
      const expected = new Set(intentGold[item.query]);
      return item.runs.map((run) => {
        const rank = run.results.findIndex((url) => expected.has(url));
        return rank < 0 ? 0 : 1 / (rank + 1);
      });
    });
    const summary = {
      coldMs: round(cold.ms),
      warmMeanMs: round(mean(durations)),
      warmMedianMs: round(percentile(durations, 0.5)),
      warmP90Ms: round(percentile(durations, 0.9)),
      top3LiteralRecall: `${relevantTop3}/${top3Denominator}`,
      mrr: roundMetric(mean(reciprocalRanks)),
      naturalZeroResults: `${naturalCases.flatMap((item) => item.runs.filter((run) => !run.results.length)).length}/${naturalQueries.length * repetitions}`,
      naturalHit3: `${naturalCases.flatMap((item) => item.runs.filter((run) => run.results.slice(0, 3).some((url) => intentGold[item.query].includes(url)))).length}/${naturalQueries.length * repetitions}`,
      naturalMrr: roundMetric(mean(naturalRanks)),
      errors: cases.flatMap((item) => item.runs.filter((run) => run.error)).length,
    };
    report.engines.push({ name: engine.name, url: engine.url, summary, cases });
    console.log(`${engine.name}: ${JSON.stringify(summary)}`);
    await writeFile(outputUrl, `${JSON.stringify(report, null, 2)}\n`);
  }
} finally {
  await browser.close();
}
