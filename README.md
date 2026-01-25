# マーケティングアプリ

手作業を受注している企業向けの顧客獲得支援ウェブアプリケーション

## 機能

1. **企業検索** - Google Places APIを使用して企業を検索
2. **AI分析** - Claude APIで手作業ニーズを自動判定
3. **HP情報取得** - Firecrawl APIでホームページをスクレイピング
4. **提案メール生成** - Claude APIで営業メールを自動生成

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **データベース**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **外部API**: Google Places API, Firecrawl API

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを編集し、以下のAPIキーを設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Places API
GOOGLE_PLACES_API_KEY=your-google-places-api-key

# Firecrawl
FIRECRAWL_API_KEY=your-firecrawl-api-key

# Claude API
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. データベースのセットアップ

Supabaseのプロジェクトを作成し、`supabase/schema.sql`のSQLを実行してテーブルを作成してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 使い方

### Step 1: 企業検索
1. ダッシュボードから「企業検索」をクリック
2. キーワード（例: 物流 倉庫）とエリア（例: 埼玉県）を入力
3. 業種を選択（任意）
4. 「企業を検索」をクリック

### Step 2: AI分析
1. 検索結果が表示されたら「全企業をAI分析」をクリック
2. AIが各企業の手作業ニーズをスコアリング
3. 高スコア（70以上）の企業を優先的にアプローチ

### Step 3: HP情報取得
1. 企業カードの「詳細を見る」をクリック
2. 「HP情報を取得」をクリック
3. ホームページから関連サービスを自動抽出

### Step 4: 提案メール生成
1. 「提案メール作成」をクリック
2. AIが企業情報に基づいた営業メールを生成
3. 必要に応じて編集
4. コピーまたはダウンロードして使用

## API取得方法

### Supabase
1. https://supabase.com でプロジェクトを作成
2. 設定 → API からURLとキーを取得

### Google Places API
1. Google Cloud Console (https://console.cloud.google.com) でプロジェクトを作成
2. Places API を有効化
3. 認証情報 → APIキーを作成

### Firecrawl
1. https://firecrawl.dev でアカウント作成
2. ダッシュボードからAPIキーを取得

### Claude API
1. https://console.anthropic.com でアカウント作成
2. APIキーを生成

## 注意事項

- Google Places APIは従量課金制（月$200の無料枠あり）
- Firecrawl APIにはレート制限があります
- Claude APIはトークン使用量に応じて課金されます
- 個人情報の取り扱いには十分注意してください

## ライセンス

MIT
