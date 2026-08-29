# スクリーンショット素材

Computer Historyは2026-08-29 13:55 JST時点で稼働していた。

ただし、Astro更新commandの実行中に前面で記録されていたのは別のChromeおよびCodex作業だった。

今回のerrorを示すComputer History画像は存在しないため、別画面の画像は流用しない。

## 今後撮影する画像

| ファイル名                         | 撮影内容                         | 画像内に必要な情報                     |
| ---------------------------------- | -------------------------------- | -------------------------------------- |
| `01-full-build-baseline.png`       | Incremental Build無効時のbuild   | command、Astro version、total time     |
| `02-release-age-rejection.png`     | release-age拒否の再現ログ        | error code、対象version、経過時間      |
| `03-peer-dependency-warning.png`   | Markdown integration不一致       | expected version、found version        |
| `04-first-incremental-build.png`   | cacheを作る最初のbuild           | cache作成、render件数、時間            |
| `05-cache-hit-build.png`           | 同一入力の二回目build            | skipされたroute、hit件数、時間         |
| `06-single-post-change.png`        | 一記事だけ変更したbuild          | renderされたrouteとskipされたroute     |
| `07-force-build.png`               | `astro build --force`            | cache bypass、full render、時間        |
| `08-artifact-parity.png`           | incrementalとforceの比較         | hash比較結果、差分なしの判定           |
| `09-cache-storage.png`             | Workers build環境のcache保存     | 保存path、archive size、restore結果    |
| `10-related-post-invalidation.png` | 関連記事変更の検証               | 変更記事と影響を受けた既存記事         |
| `11-background-dev-server.png`     | Astro 7.2のbackground dev server | 起動結果、PID、status、health endpoint |

## 撮影条件

- terminal幅とfont sizeを固定する。
- commandと結論が一枚に収まらない場合、無理に縮小せず二枚へ分ける。
- token、secret、email address、local user nameを必要に応じてmaskする。
- error直後に撮影し、あとから似たlogを作って実画面として扱わない。
- raw logも`../logs/`へ保存し、画像だけを根拠にしない。
- 公開前に画像のEXIF、window title、path、notificationを確認する。

## 画像の説明文候補

- 「公開直後のAstro 7.2.9は、リポジトリの72時間クールダウンによりinstallを拒否された」
- 「Astro coreだけを更新すると、Markdown integrationの厳密なpeer versionが不一致になった」
- 「同じcommitを二回buildし、二回目に未変更routeが再renderされなかったことを確認した」
- 「一記事の変更が、関連記事を通じて別の記事pageへ波及する」
