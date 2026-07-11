import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

const args = new Map();
for (const argument of process.argv.slice(2)) {
  const [key, value] = argument.split('=');
  args.set(key, value ?? 'true');
}

const scenario = args.get('--scenario');
const baseUrl = args.get('--base-url') ?? 'http://127.0.0.1:4321';
const outputDir = path.resolve(
  projectRoot,
  args.get('--output-dir') ?? '.astro-cache/perf/astro6-fonts'
);

if (!scenario) {
  console.error('Missing required argument: --scenario=<name>');
  process.exit(1);
}

const pages = [
  { slug: 'home', path: '/' },
  { slug: 'article', path: '/blog/astro-517-update-note/' },
];

const runs = Number(args.get('--runs') ?? '3');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const metricsFromReport = (report) => {
  const performanceScore = (report.categories.performance?.score ?? 0) * 100;
  const networkItems = report.audits['network-requests']?.details?.items ?? [];
  const fontRequests = networkItems.filter((item) => item.resourceType === 'Font');
  const transferSize = fontRequests.reduce(
    (total, item) => total + (item.transferSize ?? item.resourceSize ?? 0),
    0
  );
  const preloadLinks =
    report.audits['uses-rel-preload']?.details?.items?.filter((item) => item.url?.includes('.woff'))
      .length ?? 0;

  return {
    performanceScore: Number(performanceScore.toFixed(1)),
    largestContentfulPaint: report.audits['largest-contentful-paint']?.numericValue ?? null,
    cumulativeLayoutShift: report.audits['cumulative-layout-shift']?.numericValue ?? null,
    speedIndex: report.audits['speed-index']?.numericValue ?? null,
    totalBlockingTime: report.audits['total-blocking-time']?.numericValue ?? null,
    fontRequestCount: fontRequests.length,
    fontTransferSize: transferSize,
    preloadFontHints: preloadLinks,
  };
};

const median = (values) => {
  const numbers = values.filter((value) => typeof value === 'number').sort((a, b) => a - b);
  if (numbers.length === 0) {
    return null;
  }

  const center = Math.floor(numbers.length / 2);
  return numbers.length % 2 === 0 ? (numbers[center - 1] + numbers[center]) / 2 : numbers[center];
};

const formatMetric = (value, digits = 0) => {
  if (value === null || value === undefined) {
    return '-';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
};

const runCommand = (command, commandArgs) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: projectRoot,
      env: process.env,
      stdio: 'inherit',
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${commandArgs.join(' ')} failed with code ${code}`));
    });
  });

const captureScreenshot = async (url, filePath) => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1024 },
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: filePath, fullPage: true });
  } finally {
    await browser.close();
  }
};

const writeSummary = async (results) => {
  const summary = {
    scenario,
    generatedAt: new Date().toISOString(),
    pages: {},
  };

  const lines = [
    `# Astro 6 Fonts Measurement (${scenario})`,
    '',
    `Generated at: ${summary.generatedAt}`,
    '',
  ];

  for (const result of results) {
    const medians = {
      performanceScore: median(result.runs.map((run) => run.metrics.performanceScore)),
      largestContentfulPaint: median(result.runs.map((run) => run.metrics.largestContentfulPaint)),
      cumulativeLayoutShift: median(result.runs.map((run) => run.metrics.cumulativeLayoutShift)),
      speedIndex: median(result.runs.map((run) => run.metrics.speedIndex)),
      totalBlockingTime: median(result.runs.map((run) => run.metrics.totalBlockingTime)),
      fontRequestCount: median(result.runs.map((run) => run.metrics.fontRequestCount)),
      fontTransferSize: median(result.runs.map((run) => run.metrics.fontTransferSize)),
      preloadFontHints: median(result.runs.map((run) => run.metrics.preloadFontHints)),
    };

    summary.pages[result.slug] = {
      path: result.path,
      medians,
      runs: result.runs,
      screenshot: path.relative(outputDir, result.screenshotPath),
    };

    lines.push(`## ${result.slug}`);
    lines.push('');
    lines.push(`- URL: ${baseUrl}${result.path}`);
    lines.push(`- Screenshot: \`${path.relative(outputDir, result.screenshotPath)}\``);
    lines.push(`- Performance score median: ${formatMetric(medians.performanceScore, 1)}`);
    lines.push(`- LCP median (ms): ${formatMetric(medians.largestContentfulPaint, 0)}`);
    lines.push(`- CLS median: ${formatMetric(medians.cumulativeLayoutShift, 3)}`);
    lines.push(`- Speed Index median (ms): ${formatMetric(medians.speedIndex, 0)}`);
    lines.push(`- TBT median (ms): ${formatMetric(medians.totalBlockingTime, 0)}`);
    lines.push(`- Font request count median: ${formatMetric(medians.fontRequestCount, 0)}`);
    lines.push(`- Font transfer size median (bytes): ${formatMetric(medians.fontTransferSize, 0)}`);
    lines.push(`- Font preload hints median: ${formatMetric(medians.preloadFontHints, 0)}`);
    lines.push('');
  }

  await writeFile(
    path.join(outputDir, `${scenario}-summary.json`),
    JSON.stringify(summary, null, 2),
    'utf8'
  );
  await writeFile(path.join(outputDir, `${scenario}-summary.md`), `${lines.join('\n')}\n`, 'utf8');
};

await mkdir(outputDir, { recursive: true });
await mkdir(path.join(outputDir, 'reports'), { recursive: true });
await mkdir(path.join(outputDir, 'screenshots'), { recursive: true });

const results = [];

for (const page of pages) {
  const url = new URL(page.path, baseUrl).toString();
  const pageResult = {
    ...page,
    runs: [],
    screenshotPath: path.join(outputDir, 'screenshots', `${scenario}-${page.slug}.png`),
  };

  for (let runIndex = 1; runIndex <= runs; runIndex += 1) {
    const reportPath = path.join(
      outputDir,
      'reports',
      `${scenario}-${page.slug}-run${runIndex}.json`
    );
    await runCommand('pnpm', [
      'dlx',
      'lighthouse',
      url,
      '--preset=desktop',
      `--chrome-path=${chromePath}`,
      '--output=json',
      `--output-path=${reportPath}`,
      '--quiet',
      '--chrome-flags=--headless=new --disable-gpu --no-sandbox',
    ]);

    const report = JSON.parse(await readFile(reportPath, 'utf8'));
    pageResult.runs.push({
      run: runIndex,
      report: path.relative(outputDir, reportPath),
      metrics: metricsFromReport(report),
    });
  }

  await captureScreenshot(url, pageResult.screenshotPath);
  results.push(pageResult);
}

await writeSummary(results);
