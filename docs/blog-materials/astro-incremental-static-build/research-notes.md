# 比較とロードマップの調査メモ

確認日：2026-08-29

公式documentationと公式repositoryから確認した内容を記録する。

時間とともに変わる仕様は、記事公開前に再確認する。

## 用語の比較

| 仕組み                          | 実行時点                    | 再利用するもの                               | 無効化の主な入力                             | cacheを失った場合                     |
| ------------------------------- | --------------------------- | -------------------------------------------- | -------------------------------------------- | ------------------------------------- |
| 通常のStatic Build              | deployment前                | 原則として前回HTMLを再利用しない             | buildへの入力全体                            | 毎回生成するため意味を持たない        |
| Astro Incremental Static Builds | deployment前の`astro build` | 前回生成したpage output                      | `cacheKey`、module graph、config、dependency | 正しいが遅いfull renderになる         |
| Next.js ISR                     | deployment後のrequest時     | 配信中のpage cache                           | 時間、path、tagなどのrevalidation            | runtimeで再生成が必要になる           |
| CIのBuild Cache                 | build開始前後               | dependency、framework cache、任意のdirectory | CI providerのcache keyとscope                | installやbuildが遅くなる              |
| Workers Static Assetsのcache    | deployment後                | upload済みのstatic asset                     | 新しいdeployment、配信cache policy           | originまたはasset storeから配信される |

Astroの機能とNext.js ISRは、どちらも「全件を作り直さない」ように見える。

しかし、Astroは次のdeployment artifactを作る時間を短縮し、ISRは公開中のpageをrequestに応じて更新する。

## Next.js ISR

### 確認済み

- `revalidate`期間を過ぎた後のrequestでは、cache済みpageを返しながらbackgroundで再生成できる。
- 再生成に成功すると、それ以後のrequestへ新しいpageを返す。
- 未知のdynamic pathをon-demandで生成する構成もある。
- 完全なStatic ExportではISRを使用できない。

### 記事で使える対比

- Astro Incremental Static Buildsは、公開後のresponse freshnessを制御しない。
- Next.js ISRはruntime cacheとrevalidationを扱う。
- 「AstroにもISRが入った」と書くと、実行時点と公開後の挙動を誤って伝える。

### 公式資料

- [Next.js Incremental Static Regeneration](https://nextjs.org/docs/app/guides/incremental-static-regeneration)
- [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)

## Gatsby Incremental Builds

### 確認済み

- 前回の`.cache`と`public`を保持し、既存HTMLを再利用する。
- page template、page query、Static Query、frontendとSSRのsource codeなどを入力として追跡する。
- CMS APIとsource pluginがdelta updateを支援する場合、変更されたdataだけを取得する構成もIncremental Buildsとして扱う。

### Astroとの比較

- データとコードの変化を分けて判断する点は近い。
- Astroはpageごとのデータ同一性を`cacheKey`として開発者に明示させる。
- GatsbyはGraphQL query結果とpage build pipelineを中心に依存を追跡する。
- Gatsbyではdata sourceからの取得自体を増分化できる場合がある。
- Astro 7.2の公式説明は、前回のpage outputの再利用を中心にしている。

### 公式資料

- [Gatsby Debugging Incremental Builds](https://www.gatsbyjs.com/docs/debugging-incremental-builds/)
- [Gatsby Incremental Builds tutorial](https://www.gatsbyjs.com/docs/tutorial/creating-a-source-plugin/part-5/)

## Netlify

### Build Cache

- dependency installなどが作るdirectoryを次のbuildへ復元する。
- production branch、branch deploy、Deploy Previewでcacheのscopeとfallbackが異なる。
- cache directoryを復元する仕組みであり、Astro pageの再利用条件をNetlifyが判断するわけではない。

### On-demand Builders

- 初回accessで生成し、その後はEdge CDNから配信する。
- TTLまたはdeploymentにより更新、無効化する。
- deployment後に生成するため、比較対象としてはAstro Incremental Static BuildsよりISRに近い。

### 公式資料

- [Netlify Build troubleshooting](https://docs.netlify.com/build/configure-builds/troubleshooting-tips/)
- [Netlify On-demand Builders](https://docs.netlify.com/build/configure-builds/on-demand-builders/)

## Vercel

### Build Cache

- Install CommandとBuild Commandの前に、前回のbuild cacheを復元する。
- framework presetに応じて`node_modules`や`.next/cache`などを対象にする。
- Vercel Build Cacheがhitしても、それだけでAstro pageのrenderがskipされるとは限らない。
- Astroの`cacheDir`が保存、復元されて初めて、Astro側のpage再利用条件を評価できる。

### CDNとRuntime Cache

- CDN Cache、Runtime Cache、Data CacheはBuild Cacheとは別の層である。
- ISRや`Cache-Control`は主にdeployment後の鮮度と無効化に関わる。

### 公式資料

- [Vercel Understanding Build Cache](https://vercel.com/docs/deployments/troubleshoot-a-build)
- [Vercel Managing Builds](https://vercel.com/docs/builds/managing-builds)
- [Vercel CDN Cache](https://vercel.com/docs/caching/cdn-cache)

## Cloudflare Workers

### Workers Static Assets

- Wranglerは指定directoryのassetをWorker codeとともにuploadする。
- static assetはCloudflare network上でcache、配信される。
- これはdeployment済みの`dist`を配信するcacheであり、次回の`astro build`へ`cacheDir`を渡すbuild cacheではない。

### Workers Builds

- Workers BuildsのBuild cacheはproject単位で有効化する。
- Astroを自動検出した場合、`node_modules/.astro`をbuild output cacheとして保存する。
- pnpmについてはglobal `.pnpm-store`もdependency cacheとして保存する。
- cacheのretentionは最終readから7日、projectごとの上限は10 GBである。
- このrepositoryの`cacheDir`は、自動保存対象へ合わせて`node_modules/.astro`にした。
- GitHub Actionsなど別のCIでbuildして`wrangler deploy`する場合、CI側で`node_modules/.astro`を保存、復元する。
- repository内の設定だけでは、実際のbuild実行者とCloudflare Dashboard側のBuild cache有効状態は確定できない。

### 公式資料

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare Workers Builds build caching](https://developers.cloudflare.com/workers/ci-cd/builds/build-caching/)
- [Cloudflare Workers Builds API reference](https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/)
- [Cloudflare deploy a static site](https://developers.cloudflare.com/workers/static-assets/get-started/)

## Astroの現在の段階

### 確認済み

- Incremental Static BuildsはAstro 7.2.0で追加された。
- 2026-08-29時点でexperimental flagである。
- Astroはexperimental featureについて、patch releaseでもbreaking changeを含む可能性があると説明している。
- 現行documentationは現在のreleaseに対して更新され、過去versionのexperimental仕様を保証しない。
- 公式roadmap issueはclosedである。
- roadmap issueには、繰り返す`astro build`の高速化、重複処理の回避、将来的なdefault有効化、staticとserverを含むoutput modeの支援という方向性が記載されている。
- 同issueはISRを別問題として扱い、Incremental Buildsのscopeへ含めていない。

### 未確定

- stableへ昇格するversionと時期。
- `build.concurrency > 1`へ対応する時期。
- middleware変更を自動的にinvalidationへ含める時期。
- adapter向けの公開Incremental Build API。
- roadmap issueがclosedであることは、stable化完了を意味しない。

### 公式資料

- [Astro Incremental Static Builds](https://docs.astro.build/en/reference/experimental-flags/incremental-build/)
- [Astro experimental flags](https://docs.astro.build/en/reference/experimental-flags/)
- [withastro roadmap issue 698](https://github.com/withastro/roadmap/issues/698)

## 記事公開前の再確認項目

- Astro Incremental Static Buildsが引き続きexperimentalか。
- 使用しているAstro versionのdocumentationに同じlimitationsがあるか。
- roadmap issueまたはchangelogにstable化、仕様変更が記載されたか。
- Cloudflare側のbuild実行方式がWorkers Buildsか、外部CIか。
- cache providerが`node_modules/.astro`を保存、復元しているか。
- Next.js ISRとStatic Exportの制約が変わっていないか。
