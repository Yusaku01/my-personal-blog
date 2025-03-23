// build-ogp.js - OGP画像自動生成スクリプト
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Astroコンテンツコレクションへのパス
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content');

async function generateOGImages() {
  console.log('📜️ OGP画像を生成しています...');

  // 開発サーバーが既に起動していることを前提とする
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 出力ディレクトリを作成（public/ogpに直接出力）
  const outputDir = path.join(process.cwd(), 'public', 'ogp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // 基本ページのURLリスト
    const urls = [
      { name: 'default', path: 'index' },
      { name: 'blog', path: 'blog' },
      { name: 'profile', path: 'profile' },
      { name: 'contact', path: 'contact' },
    ];

    // ブログ記事を自動検出
    console.log('🔍 ブログ記事を検索しています...');
    const blogDir = path.join(contentDir, 'blog');

    if (fs.existsSync(blogDir)) {
      const files = fs.readdirSync(blogDir);
      for (const file of files) {
        // MDXファイルからスラッグを抽出
        if (file.endsWith('.md') || file.endsWith('.mdx')) {
          const slug = file.replace(/\.md(x)?$/, '');
          urls.push({ name: slug, path: slug });
          console.log(`  - 記事を見つけました: ${slug}`);
        }
      }
    }

    console.log(`✅ 合計 ${urls.length} ページのOGP画像を生成します`);

    // OGP画像を生成
    for (const url of urls) {
      console.log(`📷 ${url.name}のOGP画像を生成しています...`);
      await page.goto(`http://localhost:4321/api/og/${url.path}`, {
        waitUntil: 'networkidle0',
        timeout: 30000, // タイムアウトを30秒に設定
      });
      await page.setViewport({ width: 1200, height: 630 });
      await page.screenshot({ path: path.join(outputDir, `${url.name}.png`) });
      console.log(`  ✓ ${url.name}.png を保存しました`);
    }
  } catch (error) {
    console.error('❌ OGP画像生成中にエラーが発生しました:', error);
  } finally {
    await browser.close();
    console.log('🎉 OGP画像の生成が完了しました!');
  }
}

// スクリプト実行
generateOGImages();
