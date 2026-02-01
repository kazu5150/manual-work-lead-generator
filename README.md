# 顧客開拓AIナビ

手作業代行サービス向けの顧客獲得支援ウェブアプリケーション

## 機能

1. **企業検索** - Google Places APIを使用して企業を検索
2. **クイック分析** - 検索結果をAIで簡易判定(3段階評価)
3. **HP分析** - Firecrawl + Claude APIで企業HPから手作業ニーズを詳細分析
4. **2軸スコアリング** - 外注ニーズとパートナーニーズを個別にスコアリング
5. **提案メール生成** - Claude APIで営業メールを自動生成

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

`.env.local`ファイルを編集し、以下のAPIキーを設定してください:

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

Supabaseのプロジェクトを作成し、以下の順序でSQLを実行してテーブルを作成してください:

1. `supabase/schema.sql` - 基本テーブル
2. `supabase/migrations/001_add_search_conditions.sql`
3. `supabase/migrations/002_add_partner_score.sql`
4. `supabase/migrations/003_add_quick_score.sql`

#### テーブル構造

**companies** - 企業情報

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| place_id | TEXT | Google Places ID(ユニーク) |
| name | TEXT | 企業名 |
| address | TEXT | 住所 |
| phone | TEXT | 電話番号 |
| website | TEXT | Webサイト |
| rating | DECIMAL | Google評価 |
| business_type | TEXT | 業種 |
| search_keyword | TEXT | 検索キーワード |
| search_area | TEXT | 検索エリア |
| quick_score | INTEGER | クイック分析スコア(1-3) |
| quick_reason | TEXT | クイック分析理由 |
| meta_title | TEXT | HPのtitleタグ |
| meta_description | TEXT | HPのdescriptionタグ |
| ai_score | INTEGER | 外注ニーズスコア(0-100) |
| ai_reason | TEXT | AI判定理由 |
| partner_score | INTEGER | パートナーニーズスコア(0-100) |
| company_type | TEXT | 企業タイプ(outsource/partner/unknown) |
| status | TEXT | ステータス(pending/scraped/emailed) |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

**scraped_data** - HP情報

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| company_id | UUID | 企業ID(外部キー) |
| url | TEXT | スクレイピングしたURL |
| content | TEXT | HP内容 |
| extracted_services | TEXT[] | 抽出されたサービス一覧 |
| manual_work_potential | TEXT | 手作業ポテンシャル説明 |
| created_at | TIMESTAMP | 作成日時 |

**proposals** - 提案メール

| カラム | 型 | 説明 |
|--------|------|------|
| id | UUID | 主キー |
| company_id | UUID | 企業ID(外部キー) |
| subject | TEXT | メール件名 |
| body | TEXT | メール本文 |
| status | TEXT | ステータス(draft/sent) |
| created_at | TIMESTAMP | 作成日時 |

#### リレーション

```
companies (1) --- (1) scraped_data
companies (1) --- (1) proposals
```

※ `scraped_data`と`proposals`は`company_id`で`companies`に紐づき、企業削除時に連動削除(CASCADE)されます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

## 使い方

### Step 1: 企業検索 + クイック分析
1. ダッシュボードから「企業検索」をクリック
2. キーワード(例: 物流 倉庫)とエリア(例: 埼玉県)を入力
3. 業種を選択(任意)
4. 「企業を検索」をクリック
5. 検索結果に対してAIが自動で簡易分析を実行:
   - 高(3): 物流・DM発送・製造等、手作業ニーズが高い可能性
   - 中(2): 一定のニーズが推測できる
   - 低(1): 手作業ニーズが低いと判断

### Step 2: HP分析(詳細分析)
1. 企業カードの「詳細を見る」をクリック
2. 「HP分析を実行」をクリック
3. 以下の処理が自動で実行されます:
   - Firecrawl Search APIで関連ページを検索
   - 見つからなければMap APIでサイト構造から関連ページを特定
   - 関連ページをスクレイピング(最大5ページ)
   - Claude APIでサービス抽出 + 2軸スコアリング
4. 分析結果:
   - **外注ニーズスコア(0-100)**: 手作業を外注したい可能性
   - **パートナーニーズスコア(0-100)**: 繁忙期の協力会社としてのニーズ
   - **企業タイプ**: outsource(外注したい) / partner(パートナー候補) / unknown

### Step 3: 提案メール生成
1. 「提案メール作成」をクリック
2. AIが企業情報・HP内容に基づいた営業メールを生成
3. 必要に応じて編集
4. コピーまたはダウンロードして使用

## スコアリング基準

### クイック分析(3段階)
- **高(3)**: 物流・倉庫・配送・製造・EC・通販・DM発送・印刷関連、企業名に「センター」等を含む
- **中(2)**: 一定のニーズが推測できる、または情報不足で判断保留
- **低(1)**: IT企業、コンサル、士業、飲食店、美容院など明確に手作業ニーズが低い業種

### 詳細分析(2軸評価)

**外注ニーズスコア**
- 物流・倉庫・配送に関する記載あり -> 検品・梱包・仕分けニーズ
- EC・通販事業を運営 -> 梱包・発送ニーズ
- 印刷・DM事業 -> 封入・発送作業ニーズ

**パートナーニーズスコア**
- 自社で手作業サービスを提供 -> 繁忙期のキャパ補完ニーズ
- 物流センター・倉庫を運営 -> 大量案件時のパートナーニーズ
- 自社一貫体制を強調 -> キャパ超過時の外注パートナー候補

## ワークフロー

```
企業検索 -> クイック分析 -> HP分析 -> 提案メール生成
  |           |              |           |
  v           v              v           v
Places API  Claude API    Firecrawl   Claude API
            (簡易判定)    + Claude
                         (詳細分析)
```

## API取得方法

### Supabase
1. https://supabase.com でプロジェクトを作成
2. 設定 -> API からURLとキーを取得

### Google Places API
1. Google Cloud Console (https://console.cloud.google.com) でプロジェクトを作成
2. Places API を有効化
3. 認証情報 -> APIキーを作成

### Firecrawl
1. https://firecrawl.dev でアカウント作成
2. ダッシュボードからAPIキーを取得

### Claude API
1. https://console.anthropic.com でアカウント作成
2. APIキーを生成

## 注意事項

- Google Places APIは従量課金制(月$200の無料枠あり)
- Firecrawl APIにはレート制限があります
- Claude APIはトークン使用量に応じて課金されます
- 個人情報の取り扱いには十分注意してください

## ライセンス

MIT
