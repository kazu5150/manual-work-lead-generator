# マーケティングアプリ

手作業代行サービス向けの顧客獲得支援ウェブアプリケーション

## 機能

1. **企業検索** - Google Places APIを使用して企業を検索
2. **HP分析** - Firecrawl + Claude APIで企業HPから手作業ニーズを分析・スコアリング
3. **提案メール生成** - Claude APIで営業メールを自動生成

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

#### テーブル構造

**companies** - 企業情報

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| place_id | TEXT | Google Places ID（ユニーク） |
| name | TEXT | 企業名 |
| address | TEXT | 住所 |
| phone | TEXT | 電話番号 |
| website | TEXT | Webサイト |
| rating | DECIMAL | Google評価 |
| business_type | TEXT | 業種 |
| ai_score | INTEGER | AIスコア（0-100） |
| ai_reason | TEXT | AI判定理由 |
| status | TEXT | ステータス（pending/scraped/emailed） |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

**scraped_data** - HP情報

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| company_id | UUID | 企業ID（外部キー） |
| url | TEXT | スクレイピングしたURL |
| content | TEXT | HP内容 |
| extracted_services | TEXT[] | 抽出されたサービス一覧 |
| manual_work_potential | TEXT | 手作業ポテンシャル説明 |
| created_at | TIMESTAMP | 作成日時 |

**proposals** - 提案メール

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| company_id | UUID | 企業ID（外部キー） |
| subject | TEXT | メール件名 |
| body | TEXT | メール本文 |
| status | TEXT | ステータス（draft/sent） |
| created_at | TIMESTAMP | 作成日時 |

#### リレーション

```
companies (1) ─── (1) scraped_data
companies (1) ─── (1) proposals
```

※ `scraped_data`と`proposals`は`company_id`で`companies`に紐づき、企業削除時に連動削除（CASCADE）されます。

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

### Step 2: HP分析
1. 企業カードの「詳細を見る」をクリック
2. 「HP分析を実行」をクリック
3. 以下の処理が自動で実行されます：
   - Firecrawl Search APIで関連ページを検索
   - 見つからなければMap APIでサイト構造から関連ページを特定
   - 関連ページをスクレイピング（最大5ページ）
   - Claude APIでサービス抽出＋手作業ニーズをスコアリング（0-100）
4. 高スコア（70以上）の企業を優先的にアプローチ

### Step 3: 提案メール生成
1. 「提案メール作成」をクリック
2. AIが企業情報・HP内容に基づいた営業メールを生成
3. 必要に応じて編集
4. コピーまたはダウンロードして使用

## ワークフロー

```
企業検索 → HP分析 → 提案メール生成
  │           │           │
  ▼           ▼           ▼
Places API  Firecrawl   Claude API
            + Claude
```

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
