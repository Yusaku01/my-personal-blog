# 公開リポジトリ移行チェックリスト

パブリック化に伴う環境変数の再投入と動作確認フローをまとめています。Cloudflare Pages や Vercel など、デプロイ環境に合わせて調整してください。

## 1. ローカル環境の `.env`

1. `.env.example` をコピーして `.env` を再作成する。
2. 以下の値を最新の本番向けクレデンシャルに置き換える。
   - `PUBLIC_CONTACT_FORM_ENDPOINT`
   - `PUBLIC_GOOGLE_ANALYTICS_ID`
   - `PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY`
   - Qiita / Zenn のユーザー名（任意）
3. `npm run dev` で起動し、フォーム送信やダークモード切替など主要機能を確認する。

## 2. デプロイ環境のシークレット設定

- Cloudflare Pages を利用する場合、プロジェクト設定の環境変数セクションに上記キーを登録する。
- Google Analytics など第三者サービスでローテーションを実施した際は、同じ手順で最新値へ更新する。
- 値の変更後は `npm run build` → `npm run preview` をローカルで実行し、エラーがないことを確認してからデプロイする。

## 3. 秘匿情報の流出チェック

- `trufflehog --json --regex --entropy False .` を実行し、履歴に秘密情報が残っていないかを定期的に確認する。
- クラウドログや Cloudflare KV など外部サービス側の設定も併せて見直し、不要なキーは削除する。

## 4. 公開後の運用メモ

- Issue/Discussions で問い合わせを受け付ける場合は、README などに窓口を明記する。
- 追加で機密値を扱う機能を導入した場合は、`.env.example` とこのチェックリストを必ず更新する。
