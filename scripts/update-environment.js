import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// __dirname の代替を作成
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// プロジェクトのルートディレクトリを取得
const projectRoot = path.resolve(__dirname, '..');

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
    return '';
  }
}

// ファイルの役割の説明を生成
function generateFileDescriptions() {
  const descriptions = {
    'astro.config.mjs': 'Astroの設定（プラグイン、統合など）',
    'tsconfig.json': 'TypeScriptのコンパイラ設定',
    'src/layouts/Layout.astro': '全ページで使用される基本レイアウト',
    'src/components/Header.astro': 'サイトヘッダー（ナビゲーション）',
    'src/components/Footer.astro': 'サイトフッター',
    // 必要に応じて追加
  };

  let result = '## 🔑 主要ファイルの役割\n\n';

  // カテゴリごとにファイルを整理
  const categories = {
    設定ファイル: ['astro.config.mjs', 'tsconfig.json'],
    コアコンポーネント: [
      'src/layouts/Layout.astro',
      'src/components/Header.astro',
      'src/components/Footer.astro',
    ],
    ページコンポーネント: [
      'src/pages/index.astro',
      'src/pages/profile.astro',
      'src/pages/contact.astro',
    ],
    スタイル: ['src/styles/post-card.css'],
    ユーティリティ: ['src/lib/utils/', 'src/lib/api-clients/'],
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

更新は\`pnpm run dev\`実行時に自動的にチェックされます。
`;

  fs.writeFileSync(path.join(projectRoot, 'environment.md'), content);
  console.log('environment.md has been updated successfully.');
}

// スクリプトを実行
updateEnvironmentFile();
