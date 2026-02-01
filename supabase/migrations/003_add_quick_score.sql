-- 簡易AI分析・星評価機能用のカラムを追加
ALTER TABLE companies ADD COLUMN IF NOT EXISTS quick_score INTEGER CHECK (quick_score >= 1 AND quick_score <= 3);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS quick_reason TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_companies_quick_score ON companies(quick_score);
