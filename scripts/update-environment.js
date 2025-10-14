import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// __dirname の代替を作成
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトのルートディレクトリを取得
const projectRoot = path.resolve(__dirname, '..');

const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', 'dist', 'scripts']);

function generateFallbackTree(directory, maxDepth, currentDepth = 0) {
  if (currentDepth > maxDepth) {
    return [];
  }

  const entries = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !IGNORED_DIRECTORIES.has(entry.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  const lines = [];

  for (const entry of entries) {
    const indent = '  '.repeat(currentDepth);
    const name = entry.isDirectory() ? `${entry.name}/` : entry.name;
    lines.push(`${indent}${name}`);

    if (entry.isDirectory() && currentDepth + 1 < maxDepth) {
      lines.push(
        ...generateFallbackTree(path.join(directory, entry.name), maxDepth, currentDepth + 1)
      );
    }
  }

  return lines;
}

// tree コマンドの出力を取得
function getDirectoryTree() {
  try {
    const treeOutput = execSync('tree -L 3 -I "node_modules|.git|dist|scripts" --dirsfirst', {
      cwd: projectRoot,
      encoding: 'utf8',
    });
    return treeOutput;
  } catch (error) {
    console.warn('tree command not available, generating fallback directory listing.');
    const fallbackLines = generateFallbackTree(projectRoot, 3);
    return fallbackLines.join('\n');
  }
}

// ファイルの役割の説明を生成
function generateFileDescriptions() {
  const descriptions = {
    'astro.config.mjs': 'Astroの設定（プラグイン、統合など）',
    'tsconfig.json': 'TypeScriptのコンパイラ設定',
    'src/shared/layouts/Layout.astro': '全ページで使用される基本レイアウト',
    'src/shared/components/header/Header.astro': 'サイトヘッダー（ナビゲーション）',
    'src/shared/components/footer/Footer.astro': 'サイトフッター',
    'src/features/blog/api/': 'ブログ機能で利用する外部記事の取得API',
    'src/features/blog/utils/': 'ブログ向けの共通ユーティリティ',
    'src/features/contact/api/': 'お問い合わせフォーム送信ロジック',
    'src/pages/index.astro': 'トップページの Astro エントリポイント',
    'src/pages/blog/index.astro': 'ブログ一覧ページ',
    'src/pages/blog/[...slug].astro': 'ブログ詳細ページ',
    'src/pages/profile.astro': 'プロフィールページ',
    'src/pages/contact.astro': 'お問い合わせページ',
  };

  let result = '## 🔑 主要ファイルの役割\n\n';

  // カテゴリごとにファイルを整理
  const categories = {
    設定ファイル: ['astro.config.mjs', 'tsconfig.json'],
    コアコンポーネント: [
      'src/shared/layouts/Layout.astro',
      'src/shared/components/header/Header.astro',
      'src/shared/components/footer/Footer.astro',
    ],
    ページコンポーネント: [
      'src/pages/index.astro',
      'src/pages/blog/index.astro',
      'src/pages/blog/[...slug].astro',
      'src/pages/profile.astro',
      'src/pages/contact.astro',
    ],
    スタイル: ['src/styles/post-card.css'],
    ユーティリティ: [
      'src/features/blog/api/',
      'src/features/blog/utils/',
      'src/features/contact/api/',
    ],
  };

  for (const [category, files] of Object.entries(categories)) {
    result += `### ${category}\n`;
    files.forEach((file) => {
      if (descriptions[file]) {
        result += `- \`${file}\`: ${descriptions[file]}\n`;
      }
    });
    result += '\n';
  }

  return result;
}

// environment.md ファイルを更新
function updateEnvironmentFile() {
  const treeOutput = getDirectoryTree();
  const fileDescriptions = generateFileDescriptions();

  const content = `# プロジェクト環境構成

*このファイルは自動的に生成・更新されます*

## 📁 ディレクトリ構造

\`\`\`text
${treeOutput}
\`\`\`

${fileDescriptions}
## 🔄 自動更新の仕組み

このファイルは以下のタイミングで自動的に更新されます：

1. 新しいコンポーネントの追加時
2. ディレクトリ構造の変更時
3. 主要な設定ファイルの変更時

更新は\`npm run dev\`実行時に自動的にチェックされます。
`;

  fs.writeFileSync(path.join(projectRoot, 'environment.md'), content);
  console.log('environment.md has been updated successfully.');
}

// スクリプトを実行
updateEnvironmentFile();
