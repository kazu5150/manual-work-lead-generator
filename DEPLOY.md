# デプロイガイド

## 推奨: Vercel へのデプロイ

Next.jsの開発元であるVercelが最もシンプルで推奨されるデプロイ先です。

****### 手順

#### 1. GitHubにリポジトリをプッシュ
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### 2. Vercelでプロジェクトをインポート
1. https://vercel.com にアクセスしてログイン
2. 「Add New Project」をクリック
3. GitHubリポジトリを選択してインポート

#### 3. 環境変数を設定
Vercel Dashboard の「Settings」→「Environment Variables」で以下を設定：

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトのURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase公開キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー |
| `GOOGLE_PLACES_API_KEY` | Google Places APIキー |
| `FIRECRAWL_API_KEY` | Firecrawl APIキー |
| `ANTHROPIC_API_KEY` | Anthropic APIキー |

#### 4. デプロイ
「Deploy」ボタンをクリック。以降はmainブランチへのpush時に自動デプロイされます。

---

## 代替: 他のプラットフォーム

### Railway
```bash
# Railway CLIでデプロイ
npm install -g @railway/cli
railway login
railway init
railway up
```
環境変数はRailway Dashboardで設定。

### Render
1. https://render.com でWeb Serviceを作成
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start`

### セルフホスト（VPS等）
```bash
# ビルド
npm run build

# 起動（PM2推奨）
npm install -g pm2
pm2 start npm --name "marketing-app" -- start
```

---

## Supabase データベースのセットアップ

デプロイ先に関わらず、Supabaseのセットアップが必要です：

1. https://supabase.com でプロジェクト作成
2. SQL Editor で `supabase/schema.sql` を実行
3. 「Settings」→「API」からURL・キーを取得

---

## 確認事項

- [ ] 全ての環境変数が設定されているか
- [ ] Supabaseテーブルが作成されているか
- [ ] 各外部APIキーが有効か（Google Places, Firecrawl, Anthropic）
