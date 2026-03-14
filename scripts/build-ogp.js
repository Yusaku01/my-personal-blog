import { runBuildOgp } from './lib/build-ogp-core.js';

runBuildOgp().catch((error) => {
  console.error('❌ OGP画像生成中にエラーが発生しました:', error);
  process.exit(1);
});
