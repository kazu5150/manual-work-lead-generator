/**
 * クローリング対象ページ選択用のキーワード定義
 * 業種別・共通キーワードと生成関数を提供
 */

// 業種別キーワード（Search API用）
export const BUSINESS_SEARCH_KEYWORDS: Record<string, string[]> = {
  logistics: [
    '物流', '倉庫', '配送', '検品', '梱包', '仕分け', 'ピッキング',
    'logistics', 'warehouse', 'shipping', 'packing'
  ],
  manufacturing: [
    '製造', '組立', '加工', '検査', '部品', '生産',
    'manufacturing', 'assembly', 'production'
  ],
  retail: [
    'EC', '通販', '梱包', '発送', 'フルフィルメント', '在庫管理',
    'e-commerce', 'fulfillment', 'inventory'
  ],
  food: [
    '食品', '加工', 'パッケージング', '仕分け', '包装', '衛生',
    'food processing', 'packaging'
  ],
  printing: [
    '印刷', 'DM', '封入', '発送', 'ダイレクトメール', '封筒',
    'printing', 'mailing', 'direct mail'
  ],
};

// 業種別キーワード（Map API用）
export const BUSINESS_MAP_KEYWORDS: Record<string, string[]> = {
  logistics: ['物流サービス', '倉庫サービス', '検品サービス', '梱包サービス'],
  manufacturing: ['製造サービス', '組立サービス', '加工サービス', '製品'],
  retail: ['ECサービス', '通販支援', 'フルフィルメント', '発送代行'],
  food: ['食品加工', 'パッケージング', '加工サービス'],
  printing: ['印刷サービス', 'DM発送', '封入サービス', 'メール便'],
};

// 共通キーワード（Search API用）- 手作業代行の可能性を示すキーワード
export const COMMON_SEARCH_KEYWORDS: string[] = [
  // 日本語
  '手作業', '外注', '委託', '作業', 'サービス', '代行',
  'アウトソーシング', '業務委託', '請負',
  // 英語
  'outsourcing', 'manual work', 'service', 'subcontract'
];

// 共通キーワード（Map API用）- ページタイプを示すキーワード
export const COMMON_MAP_KEYWORDS: string[] = [
  // 日本語ページタイプ
  'サービス', '事業', '会社概要', '料金', '実績', '事例', 'お客様の声',
  '導入事例', 'ソリューション', '業務内容', 'サービス一覧',
  // 英語ページタイプ
  'service', 'about', 'price', 'case', 'solution', 'business', 'works'
];

/**
 * Search API用のキーワード配列を生成
 * @param businessType 業種（logistics, manufacturing等）
 * @param searchKeyword 検索時に使用したキーワード
 * @returns キーワード配列
 */
export function generateSearchKeywords(
  businessType?: string | null,
  searchKeyword?: string | null
): string[] {
  const keywords = new Set<string>(COMMON_SEARCH_KEYWORDS);

  // 業種別キーワードを追加
  if (businessType && BUSINESS_SEARCH_KEYWORDS[businessType]) {
    BUSINESS_SEARCH_KEYWORDS[businessType].forEach(kw => keywords.add(kw));
  }

  // 検索キーワードを追加（複数語の場合は分割）
  if (searchKeyword) {
    // スペース区切りで分割して追加
    searchKeyword.split(/[\s　]+/).forEach(kw => {
      if (kw.trim()) {
        keywords.add(kw.trim());
      }
    });
  }

  return Array.from(keywords);
}

/**
 * Map API用の検索語句文字列を生成
 * @param businessType 業種（logistics, manufacturing等）
 * @param searchKeyword 検索時に使用したキーワード
 * @returns OR結合された検索語句文字列
 */
export function generateMapSearchTerms(
  businessType?: string | null,
  searchKeyword?: string | null
): string {
  const terms = new Set<string>(COMMON_MAP_KEYWORDS);

  // 業種別キーワードを追加
  if (businessType && BUSINESS_MAP_KEYWORDS[businessType]) {
    BUSINESS_MAP_KEYWORDS[businessType].forEach(kw => terms.add(kw));
  }

  // 検索キーワードを追加
  if (searchKeyword) {
    searchKeyword.split(/[\s　]+/).forEach(kw => {
      if (kw.trim()) {
        terms.add(kw.trim());
      }
    });
  }

  return Array.from(terms).join(' OR ');
}
