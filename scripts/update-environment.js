import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// __dirname の代替を作成
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトのルートディレクトリを取得
const projectRoot = path.resolve(__dirname, '..');

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'scripts']);

function buildDirectoryTreeFallback(rootDir, maxDepth = 3) {
  const lines = ['.'];

  function walk(currentDir, depth, prefix) {
    if (depth >= maxDepth) {
      return;
    }

    const entries = fs
      .readdirSync(currentDir, { withFileTypes: true })
      .filter((entry) => !IGNORED_DIRS.has(entry.name))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      lines.push(`${prefix}${connector}${entry.name}`);

      if (entry.isDirectory()) {
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        walk(path.join(currentDir, entry.name), depth + 1, nextPrefix);
      }
    });
  }

  walk(rootDir, 0, '');
  return `${lines.join('\n')}\n`;
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
    console.error('Error getting directory tree:', error);
    return buildDirectoryTreeFallback(projectRoot);
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
    'src/pages/index.astro': 'トップページ',
    'src/pages/profile.astro': 'プロフィールページ',
    'src/pages/contact.astro': 'お問い合わせページ',
    'src/styles/unoVariants.ts': 'UnoCSSのバリアント設定とユーティリティ',
    'src/shared/utils/ogp.ts': 'OGP画像を取得し最適化するユーティリティ',
    'src/features/blog/api/qiita.ts': 'Qiitaの記事一覧を取得するAPIクライアント',
    'src/features/blog/api/zenn.ts': 'Zennの記事一覧を取得するAPIクライアント',
    'src/features/contact/api/contact.ts': 'お問い合わせフォーム送信処理',
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
      'src/pages/profile.astro',
      'src/pages/contact.astro',
    ],
    スタイル: ['src/styles/unoVariants.ts'],
    ユーティリティ: [
      'src/shared/utils/ogp.ts',
      'src/features/blog/api/qiita.ts',
      'src/features/blog/api/zenn.ts',
      'src/features/contact/api/contact.ts',
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
