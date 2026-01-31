-- マーケティングアプリ データベーススキーマ
-- Supabase PostgreSQL用

-- companies テーブル
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  website TEXT,
  rating DECIMAL,
  business_type TEXT,
  search_keyword TEXT,
  search_area TEXT,
  ai_score INTEGER,
  ai_reason TEXT,
  partner_score INTEGER,
  company_type TEXT CHECK (company_type IN ('outsource', 'partner', 'unknown')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scraped', 'emailed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- scraped_data テーブル
CREATE TABLE IF NOT EXISTS scraped_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  url TEXT,
  content TEXT,
  extracted_services TEXT[],
  manual_work_potential TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- proposals テーブル
CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_ai_score ON companies(ai_score);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at);
CREATE INDEX IF NOT EXISTS idx_scraped_data_company_id ON scraped_data(company_id);
CREATE INDEX IF NOT EXISTS idx_proposals_company_id ON proposals(company_id);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) ポリシー
-- 開発用: すべてのアクセスを許可
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザー用ポリシー（必要に応じて調整）
CREATE POLICY "Allow all access to companies" ON companies FOR ALL USING (true);
CREATE POLICY "Allow all access to scraped_data" ON scraped_data FOR ALL USING (true);
CREATE POLICY "Allow all access to proposals" ON proposals FOR ALL USING (true);
