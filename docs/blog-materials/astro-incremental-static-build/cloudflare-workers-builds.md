# Cloudflare Workers Builds実環境検証

実施日：2026-08-29

同じcommit `b89d87e`をCloudflare Workers Buildsで二回buildした。

## 初回build

- Build ID：`a12ed73b-fa13-49b7-aa98-2043c7d77ebd`
- 全体：1分1秒
- 初期化：2秒
- clone：3秒
- install：19秒
- build：29秒
- deploy：9秒
- Astro server build：21.52秒

Cloudflareはdependencies cacheとbuild output cacheの復元処理を開始した。

ただし、`cacheDir`を`node_modules/.astro`へ変更した最初のbuildなので、記事routeはすべてrenderされた。

このbuildが新しい場所へIncremental Build cacheを保存する初回になった。

## 同一commitの再build

- Build ID：`d51a0faa-8cda-487c-9f27-5beaf5685050`
- 全体：1分13秒
- 初期化：2秒
- clone：2秒
- install：21秒
- build：37秒
- deploy：10秒

Cloudflareのログにbuild output cacheの復元成功が記録された。

```text
Restoring from build output cache
Success: Build output restored from build cache.
```

続くAstro buildでは、Markdown、日本語HTML、英語HTMLの記事routeに`(restored)`が表示された。

```text
/blog/about-ast/index.html (restored)
/en/blog/about-ast/index.html (restored)
```

## 結果の解釈

`node_modules/.astro`がWorkers Builds間で保存、復元され、Astroが前回の記事成果物を再利用できることを実環境で確認できた。

一方、二回目のdeployment全体は初回より12秒長かった。

記事routeのrender省略だけでは、現時点の全体時間を短縮できていない。

次の処理は二回目にも残っている。

- dependency install
- OGP画像の全件生成
- server/client bundle
- `getStaticPaths()`と関連記事選択
- Incremental Build対象外routeのrender
- optimized image処理
- Wrangler deploy

今回の導入価値は、現時点の速度改善より、記事数とMDX変換処理が増えたときの再render範囲を限定できることにある。

二回だけの比較なので、1分1秒と1分13秒の差を性能の結論には使わない。

## スクリーンショット

- `screenshots/cloudflare-build-output-cache-restored.png`
  - Cloudflareがbuild output cacheを復元したログ。
- `screenshots/cloudflare-workers-build-restored.png`
  - Astroの記事routeが`(restored)`になったログ。
