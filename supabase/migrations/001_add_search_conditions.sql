-- 検索条件カラムを追加
ALTER TABLE companies ADD COLUMN IF NOT EXISTS search_keyword TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS search_area TEXT;

-- インデックス追加（検索条件でのフィルター用）
CREATE INDEX IF NOT EXISTS idx_companies_search_keyword ON companies(search_keyword);
CREATE INDEX IF NOT EXISTS idx_companies_search_area ON companies(search_area);
