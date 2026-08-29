# Astro View Transitions表示崩れの診断メモ

調査日：2026-08-29

## 結論

今回再現した主因は、テーマ情報の引き継ぎ失敗ではない。

AstroのClientRouterで最初のsoft navigationを行った後、開発環境でUnoCSSのstyle要素の一部がheadから失われた。

その結果、`localStorage.theme`と`html.dark`は維持されているにもかかわらず、dark themeやmarginを表現するutility CSSが適用されなくなった。

静的build成果物では同じ遷移を行っても再現しなかった。

したがって、現時点では次の順序で疑う。

1. Astro ClientRouterのhead差し替えとVite、UnoCSSの開発用style注入の組み合わせ
2. このrepositoryのtransition指定とlifecycle eventの使い方
3. fixed headerとpageごとに分散した余白設計
4. それでも残る場合に、browser固有のView Transition API実装

Astro 7.2.7への更新が新たにこの問題を起こした、とはまだ断定できない。

同種のdevelopment-only問題はAstro 6でも報告されており、Astro 7.2.7には同じhead swap周辺を変更した修正が含まれる。

## 再現環境

- Astro 7.2.7
- Chromium 148
- `astro dev`
- `@unocss/astro` 66.7.0
- `ClientRouter`によるsoft navigation
- themeは`localStorage.theme`と`html.dark`で管理

## テーマ状態は失われていなかった

`src/layouts/Layout.astro`のtheme scriptは、初期表示で`localStorage.theme`を読み、`html.dark`を更新する。

さらに`astro:before-swap`で新しいdocumentへclassをコピーし、`astro:after-swap`でもthemeを再適用している。

これはAstro公式documentationが示すtheme persistenceの考え方と一致する。

実際にdark themeを選択し、ClientRouterで30回遷移して確認した結果は次のとおりだった。

- `localStorage.theme`は常に`dark`
- current documentの`html`は常に`js dark`
- swap直前と直後にも`dark` classは失われなかった

ここから、保存値とDOM classの引き継ぎは今回の主因ではないと判断した。

## 消えていたのはUnoCSSのstyle要素だった

最初の`/profile`表示には、開発用のUnoCSS style要素が二つ存在した。

```text
data-vite-dev-id="/__uno.css"
data-vite-dev-id="<repository-root>/__uno.css"
```

後者には`.bg-gray-100`など、pageの見た目に必要なutilityが含まれていた。

ClientRouterで一度遷移すると後者だけが消え、残った`/__uno.css`には`.bg-gray-100`が含まれていなかった。

computed styleも次のように変化した。

```text
初期light themeのmain背景: rgb(243, 244, 246)
初期dark themeのmain背景:  rgb(31, 41, 55)
遷移後dark themeのmain背景: rgba(0, 0, 0, 0)
```

`html.dark`は残っているのにmainが白く見えたのは、theme状態がlightへ戻ったからではない。

背景や余白を作るCSS rule自体が適用されなくなったためである。

> dark modeが消えたように見えたが、localStorageもdark classも残っていた。消えていたのは状態ではなく、状態を見た目へ変換するCSSだった。

## 静的build成果物では再現しなかった

`dist/client`をHTTP serverで配信し、次の順序でClientRouter遷移を行った。

```text
/profile/ -> / -> /profile/ -> /finds/
```

結果は次のとおりだった。

- `localStorage.theme`は`dark`のまま
- `html.dark`も維持
- main背景は`rgb(31, 41, 55)`を維持
- Heroのpaddingは`260px`を維持

production buildではpage間で同じhashed CSS assetを参照しており、開発環境にあるViteのstyle注入とhead差し替えの競合が起きなかった。

この再現結果だけを見る限り、Cloudflare Workers Static Assetsで配信されるproduction runtimeや、browserのView Transition APIそのものが第一原因ではない。

ただし、実際のWorkers deploymentでも最終確認は必要である。

## 公式Issueとの対応

### Astro Issue #16204

Astro 6.1.3への更新後、ClientRouter遷移でUnoCSS styleを読み込めないというdevelopment-onlyの報告がある。

- productionでは再現しない
- UnoCSSとClientRouterの組み合わせ
- head swap後にstyleが不足する

今回の症状と近い。

このIssueはPR #16242で修正された。

- Issue: <https://github.com/withastro/astro/issues/16204>

### Astro Issue #16373

UnoCSSの`@apply`と`--at-apply`を使うと、ClientRouter遷移後にstyleを読み込めないというdevelopment-onlyの報告もある。

production buildでは問題がない点も今回と共通する。

提案されたPR #16383はmergeされず、再現する場合は新しいIssueを作成するよう案内されてcloseされた。

- Issue: <https://github.com/withastro/astro/issues/16373>

### Astro PR #17612

Astro 7.2.7に含まれるPR #17612は、ClientRouterのhead swapでVite CSS HMR nodeを維持し、UnoCSSが同じIDの内容を更新できるようにする変更である。

今回消えたstyle要素も、このhead swap処理と同じ領域にある。

ただし、今回のdocumentには`/__uno.css`とabsolute pathの`__uno.css`が同時に存在し、後者だけが消えた。

PR #17612と同一原因だと断定せず、Cloudflare integrationを含む最小再現を作って確認する必要がある。

- PR: <https://github.com/withastro/astro/pull/17612>

## このrepository側で見つかった別の注意点

### routeの`export const transition`は現在の指定方法ではない

19個のrouteに次のようなexportがある。

```ts
export const transition = { name: 'fade' };
```

一方、このrepositoryには`transition:name`、`transition:animate`、`transition:persist`や、custom `::view-transition-*` CSSがない。

現在のAstro公式APIはtemplate directiveで指定する。

生成HTMLにもこのexportに対応するnamed transitionは見つからなかった。

そのため、現在見えているfadeはこのexportではなく、ClientRouterのdefault animationである可能性が高い。

### 一部の初期化処理を二つのeventで実行している

Header、code copy、image zoom、目次などの一部scriptは、`astro:after-swap`と`astro:page-load`の両方で初期化する。

Astroでは`astro:page-load`が新しいpageの表示とscript実行後に毎回発火する。

Headerは`AbortController`で古いlistenerを破棄しているため直ちに重複listenerにはならないが、一回の遷移でsetupを二回行うため、timingの曖昧さが増える。

### fixed headerに対する余白がpage側へ分散している

Headerはfixed positioningでdocument flowに高さを持たない。

通常pageはHeroのpadding、記事pageはroute固有の`calc(...)`でheaderとの距離を確保している。

UnoCSSが消える問題を解消した後もmargin jumpが残る場合は、header offsetを共通tokenまたはlayoutのspacerとして一箇所で管理できるか確認する。

## browser API側で引き続き注意する点

View Transition APIは、遷移前のsnapshotと遷移後のlive representationをpseudo-element tree上でanimationする。

そのため、次のような要素はbrowser固有の差が出やすい。

- fixedまたはsticky element
- scroll positionが変わるpage
- snapshot中にsizeやfont metricsが変わるelement
- 同じ`view-transition-name`を複数elementへ付けた場合

ただし、今回の崩れはanimation終了後も残り、computed CSS ruleの欠落を確認できた。

そのため、snapshot overlayやbrowser animation bugを第一原因にはしない。

## 次に行うと切り分けが進む作業

1. 最小repositoryでAstro、ClientRouter、UnoCSS、Cloudflare integrationだけを組み合わせて再現する。
2. Cloudflare integrationを外した場合にabsolute pathの`__uno.css`が重複生成されるか比較する。
3. Astro 7.1.3と7.2.7を同じlockfile条件で比較し、version更新との因果を確認する。
4. UnoCSS 66.8.1へ上げた比較を行う。ただし、changelogに直接対応する修正は見つかっていないため、確定fixとして扱わない。
5. reproductionを添えてAstroまたはUnoCSSへIssueを報告する。
6. production相当のWorkers previewと実deploymentでもtheme、background、header offsetを確認する。
7. CSS欠落を解消後、routeのtransition指定とlifecycle listenerを整理する。

## スクリーンショット素材

- `screenshots/view-transitions-dev-before.png`
  - dark themeが正しく適用された`/profile`
  - ClientRouter遷移前
- `screenshots/view-transitions-dev-after.png`
  - `/`へのClientRouter遷移後
  - headerとHeroはdarkのままだが、mainが白くなりutility CSS欠落が見える

この二枚は同じbrowser sessionで連続して撮影した。

theme stateの変化ではなく、遷移を境にしたstyle適用の変化を示す比較素材として使える。

## 公式資料

- Astro View Transitions guide: <https://docs.astro.build/en/guides/view-transitions/>
- MDN Using the View Transition API: <https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using>
