import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const engines = [
  { name: 'Current', url: 'http://127.0.0.1:4331/blog/', kind: 'current' },
  { name: 'Jev', url: 'http://127.0.0.1:4332/search-lab/', kind: 'lab' },
  { name: 'Cloudflare AI Search', url: 'http://127.0.0.1:4333/search-lab/', kind: 'lab' },
  { name: 'Orama', url: 'http://127.0.0.1:4334/search-lab/', kind: 'lab' },
  { name: 'Pagefind', url: 'http://127.0.0.1:4335/search-lab/', kind: 'lab' },
  { name: 'Fuse.js', url: 'http://127.0.0.1:4336/search-lab/', kind: 'lab' },
];
const repetitions = 3;
const casesUrl = new URL('../benchmarks/search-lab/task-cases.json', import.meta.url);
const outputUrl = new URL('../benchmarks/search-lab/task-results.json', import.meta.url);
const cases = JSON.parse(await readFile(casesUrl, 'utf8'));

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

const browser = await chromium.launch({ headless: true });
const report = { generatedAt: new Date().toISOString(), repetitions, cases, engines: [] };
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
    const results = [];
    for (const task of cases) {
      const runs = [];
      for (let index = 0; index < repetitions; index++) {
        runs.push(await runQuery(page, task.query, engine.kind));
      }
      results.push({ id: task.id, runs });
    }
    await page.close();
    const answerCases = results.filter(
      (result) => cases.find((task) => task.id === result.id).article
    );
    const relevantInTop3 = answerCases.reduce((count, result) => {
      const article = cases.find((task) => task.id === result.id).article;
      return count + result.runs.filter((run) => run.results.slice(0, 3).includes(article)).length;
    }, 0);
    const absentCase = results.find((result) => result.id === 'absent-astro-8-date');
    const summary = {
      relevantArticleTop3: `${relevantInTop3}/${answerCases.length * repetitions}`,
      noAnswerZeroResults: `${absentCase.runs.filter((run) => !run.results.length).length}/${repetitions}`,
      errors: results.flatMap((result) => result.runs.filter((run) => run.error)).length,
    };
    report.engines.push({ name: engine.name, url: engine.url, summary, results });
    console.log(`${engine.name}: ${JSON.stringify(summary)}`);
    await writeFile(outputUrl, `${JSON.stringify(report, null, 2)}\n`);
  }
} finally {
  await browser.close();
}
