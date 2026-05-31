# 公開リポジトリ移行チェックリスト

パブリック化に伴う環境変数の再投入と動作確認フローをまとめています。Cloudflare Workers Static Assets へのデプロイを前提にしています。

## 1. ローカル環境の `.env`

1. `.env.example` をコピーして `.env` を再作成する。
2. 以下の値を最新の本番向けクレデンシャルに置き換える。
   - `PUBLIC_GOOGLE_ANALYTICS_ID`
   - `PUBLIC_TURNSTILE_SITE_KEY`（Cloudflare Turnstile のサイトキー）
   - `TURNSTILE_SECRET_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
   - Qiita / Zenn のユーザー名（任意）
3. ローカル確認では Cloudflare Turnstile の公式テストキーを使える。本番キーを `localhost` に許可しなくてもよい。
4. `pnpm run dev` で起動し、フォーム送信やダークモード切替など主要機能を確認する。

## 2. デプロイ環境のシークレット設定

- `TURNSTILE_SECRET_KEY` は Wrangler secret として登録する。
- `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `PUBLIC_TURNSTILE_SITE_KEY` は公開されても問題ない値として `wrangler.jsonc` の vars か Cloudflare 側の変数で管理する。
- `CONTACT_DB` の D1 binding と `EMAIL` の Email Sending binding を `wrangler.jsonc` と Cloudflare 側で一致させる。
- D1 は `saku-space-contact` / `7cfb9a52-694f-4c2b-aa06-0052e6080186` を使用する。schema は `migrations/0001_contact_submissions.sql` と一致させる。
- Email Sending は `saku-space.com` を sending domain とし、`contact@saku-space.com` から送信する。Cloudflare 側で `cf-bounce.saku-space.com` の MX/SPF/DKIM と `_dmarc.saku-space.com` の DNS status が `ready` であることを確認する。
- Turnstile 本番 widget は `saku-space-contact` を作成済み。公開サイトキーは `wrangler.jsonc` の `PUBLIC_TURNSTILE_SITE_KEY` に反映済み。
- Google Analytics など第三者サービスでローテーションを実施した際は、同じ手順で最新値へ更新する。
- 値の変更後は `pnpm run build` → `pnpm run preview` をローカルで実行し、エラーがないことを確認してからデプロイする。

## 3. 秘匿情報の流出チェック

- `trufflehog --json --regex --entropy False .` を実行し、履歴に秘密情報が残っていないかを定期的に確認する。
- クラウドログや Cloudflare KV など外部サービス側の設定も併せて見直し、不要なキーは削除する。

## 4. 公開後の運用メモ

- Issue/Discussions で問い合わせを受け付ける場合は、README などに窓口を明記する。
- 追加で機密値を扱う機能を導入した場合は、`.env.example` とこのチェックリストを必ず更新する。
