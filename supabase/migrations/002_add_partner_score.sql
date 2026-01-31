-- パートナースコアと企業タイプカラムを追加
ALTER TABLE companies ADD COLUMN IF NOT EXISTS partner_score INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_type TEXT CHECK (company_type IN ('outsource', 'partner', 'unknown'));

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_companies_partner_score ON companies(partner_score);
CREATE INDEX IF NOT EXISTS idx_companies_company_type ON companies(company_type);
