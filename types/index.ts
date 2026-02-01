export type CompanyType = 'outsource' | 'partner' | 'unknown';

export interface Company {
  id: string;
  place_id: string | null;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  business_type: string | null;
  search_keyword: string | null;
  search_area: string | null;
  ai_score: number | null;
  ai_reason: string | null;
  partner_score: number | null;
  company_type: CompanyType | null;
  quick_score: QuickScore | null;
  quick_reason: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: 'pending' | 'scraped' | 'emailed';
  created_at: string;
  updated_at: string;
}

// 簡易AI分析の星評価（1-3の3段階）
export type QuickScore = 1 | 2 | 3;

// 検索プレビュー用の企業情報（DB保存前）
export interface PreviewCompany {
  place_id: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  business_type: string | null;
  search_keyword: string;
  search_area: string;
  quick_score: QuickScore;
  quick_reason: string;
  meta_title: string | null;
  meta_description: string | null;
  selected: boolean;
}

export interface ScrapedData {
  id: string;
  company_id: string;
  url: string | null;
  content: string | null;
  extracted_services: string[] | null;
  manual_work_potential: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  company_id: string;
  subject: string | null;
  body: string | null;
  status: 'draft' | 'sent';
  created_at: string;
}

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  types?: string[];
}

export interface SearchParams {
  keyword: string;
  location: string;
  businessType?: string;
}

export interface AnalysisResult {
  score: number;
  partnerScore: number;
  companyType: CompanyType;
  reason: string;
  manualWorkPotential: string;
  recommendedApproach: string;
}

export interface EmailGenerationParams {
  companyName: string;
  companyInfo: string;
  scrapedContent: string;
  services: string[];
}

export interface GeneratedEmail {
  subject: string;
  body: string;
}

export const BUSINESS_TYPES = [
  { value: 'logistics', label: '物流・倉庫業（検品・梱包・仕分け）' },
  { value: 'manufacturing', label: '製造業（組立・検品・加工）' },
  { value: 'retail', label: '小売・通販（EC梱包・発送）' },
  { value: 'food', label: '食品加工（パッケージング・仕分け）' },
  { value: 'printing', label: '印刷・DM発送（封入・発送作業）' },
  { value: 'other', label: 'その他' },
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number]['value'];
