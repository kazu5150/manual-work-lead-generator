# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**顧客開拓AIナビ** - 手作業代行サービス向けの顧客獲得支援アプリ。企業検索→HP分析→提案メール生成のワークフローを提供。

## コマンド

```bash
npm run dev      # 開発サーバー起動 (localhost:3000)
npm run build    # プロダクションビルド
npm run start    # プロダクションサーバー起動
npm run lint     # ESLint実行
```

## アーキテクチャ

### データフロー
```
Google Places API → companies テーブル → HP分析(Search+Map+Scrape+Claude) → scraped_data → メール生成 → proposals
```

### API Routes (`app/api/`)
- `search/` - Google Places APIで企業検索、Supabaseに保存
- `scrape/` - **メインの分析API**
  1. Firecrawl Search APIで関連ページを検索
  2. 見つからなければMap APIでサイト構造から関連ページを特定
  3. 関連ページをスクレイピング
  4. Claude APIでサービス抽出＋手作業ニーズをスコアリング
- `generate-email/` - Claude APIで提案メール生成
- `companies/` - 企業一覧・詳細取得

### データベース (Supabase)
- `companies` - 企業情報、AI分析スコア、ステータス管理
- `scraped_data` - HP内容、抽出サービス一覧
- `proposals` - 生成されたメール

### 企業ステータス遷移
```
pending → scraped → emailed
```

### 外部API連携 (`lib/`)
- `google-places.ts` - Text Search API + Place Details API
- `firecrawl.ts` - Search API / Map API / Scrape API
  - `searchWebsite()` - サイト内キーワード検索
  - `mapWebsite()` - サイト構造からURL一覧取得
  - `scrapeWebsite()` - 単一ページスクレイピング
  - `scrapeMultipleUrls()` - 複数ページ一括スクレイピング
- `claude.ts` - AI処理
  - `analyzeCompanyWithContent()` - HP内容ベースの分析（メイン）
  - `extractServicesFromContent()` - サービス抽出
  - `generateProposalEmail()` - メール生成

### UIコンポーネント
shadcn/uiベース。`components/ui/`に基本コンポーネント、ルート`components/`にアプリ固有コンポーネント。

## 環境変数

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_PLACES_API_KEY
FIRECRAWL_API_KEY
ANTHROPIC_API_KEY
```
