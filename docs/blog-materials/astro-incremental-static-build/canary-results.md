# Incremental Static Builds canary結果

実施日：2026-08-29

## 対象をMarkdown endpointへ絞った理由

このrepositoryで`getStaticPaths()`を持つrouteは三つある。

- `/blog/[...slug]`
- `/en/blog/[...slug]`
- `/blog/[...slug].md`

HTML記事routeは、現在の記事だけでなく、関連記事として選ばれた別の記事にも出力が依存する。

`cacheKey: post.digest`だけでは、その別記事の追加、更新、選択順変更を表現できない。

Markdown endpointの出力は該当記事の`body.trim()`だけで決まるため、entry digestを完全なkeyとして使える。

最初のcanaryには、この依存関係が小さく説明できるrouteを選んだ。

## 実装

`astro.config.mjs`で実験機能を有効にした。

```js
experimental: {
  incrementalBuild: true,
},
```

Markdown endpointの`getStaticPaths()`へ`cacheKey`を追加した。

```ts
return posts.map((post) => ({
  params: { slug: getBlogEntrySlug(post) },
  cacheKey: String(post.digest ?? post.body ?? ''),
}));
```

通常はglob loaderが生成する`post.digest`を使う。

型上はdigestがoptionalなので、存在しない場合にも出力とkeyが対応するよう本文をfallbackにした。

## 検証1：force build

```text
pnpm exec astro build --force
```

- Markdown endpoint 29件をすべてrenderした。
- `.astro-cache/incremental-build.json`へ29 pathを記録した。
- Server buildは14.94秒だった。
- Markdown endpoint自体は一件1〜3msだった。

`--force`は既存manifestを再利用しないが、次回用cacheは作り直す。

## 検証2：同一入力のwarm build

```text
pnpm exec astro build
```

29件すべてで次の表示を確認した。

```text
/blog/about-ast.md (restored)
```

force buildとwarm buildの29ファイルをSHA-256で比較し、差分はなかった。

この時点で確認できたのは、単にbuildが成功することではなく、次の二点である。

- Astroがcache manifestと保存済みoutputを使ってrenderを省略した。
- 省略して復元した成果物がforce buildの成果物とbyte単位で一致した。

## 検証3：一記事の追加

検証用の記事を一時的に一件追加してbuildした。

```text
/blog/about-ast.md (restored)
...
/blog/incremental-build-canary-temp.md (+2ms)
...
```

結果は次のとおりだった。

- 既存29件：restore
- 新規1件：render

新しいrouteが増えても、既存routeを一律に再生成しなかった。

ただし、HTML記事pageはcanary対象外なので、新記事により関連記事欄が変わるHTMLは通常どおり再renderされた。

## 検証4：一記事の削除

検証記事を削除して再buildした。

```text
[build] Pruned 1 stale file(s) from the incremental cache.
```

- manifestは29 pathへ戻った。
- 削除したrouteは`dist`にもcache manifestにも残らなかった。
- 残る29ファイルのSHA-256はforce build baselineと一致した。

## 発生した環境エラー

sandbox内の最初のforce buildは次のエラーで停止した。

```text
Error: listen EPERM: operation not permitted 0.0.0.0
```

Astro Fonts integrationがbuild時に使うlocal HTTP serverのlistenをsandboxが拒否した。

通常環境で同じcommandを実行するとbuildは成功したため、Incremental Static Builds、Cloudflare adapter、記事データの問題ではない。

同じ実行ではWranglerのdebug log書き込みもsandboxに拒否された。

```text
Failed to write to log file Error: EPERM: operation not permitted
```

記事では「エラーメッセージが出たprocess」と「実際に失敗した機能」を分ける例として使える。

## 性能について現時点で言えること

Markdown endpointだけを見ると29件のrenderを省略できた。

一方、Server build全体はforce時14.94秒、warm時14.35秒で、大幅な差ではなかった。

理由は次のとおりである。

- Markdown endpointは元から一件1〜3msと軽い。
- server/client bundleは毎回buildされる。
- `getStaticPaths()`を持たない静的routeは毎回renderされる。
- `/blog/personal`の生成だけで約2.3〜2.7秒かかる。
- OGP生成を含む`build:cloudflare`全体は今回の計測対象外である。
- cache archiveの保存、復元時間もまだ含めていない。

今回のcanaryは性能改善ではなく、正しい差分再利用と退避経路を確認するためのものだった。

## 作業者として感じたこと

- `incrementalBuild: true`を書くことより、あるoutputを決める入力を全部説明することのほうが難しい。
- 最初のcanaryを軽いrouteにすると性能差は出にくいが、cache keyの正しさを小さな範囲で確認できる安心感がある。
- `(restored)`というroute単位の表示は分かりやすいが、全体summaryとしてhit率や復元byte数も欲しくなった。
- 一記事追加と削除を試すと、cache hitだけでなく、新規routeとorphan cleanupまで一続きで理解できた。
- 速くなった数字を先に探すより、force buildとの同一性を先に確認したほうが実験機能を信頼しやすい。

## 次の段階

1. HTML記事の関連記事選択を`getStaticPaths()`側で確定する。
2. 現在の記事と表示する関連記事を同じpropsへ入れる。
3. そのprops全体を安定した順序で`cacheKey`へ含める。
4. 日本語HTMLで一記事変更と関連記事の波及を検証する。
5. 英語fallback routeにも同じ設計を適用する。
6. Workersの実build環境で`.astro-cache`をbuild前後にrestore/saveする。
7. OGP生成とcache転送を含むdeployment全体を計測する。
