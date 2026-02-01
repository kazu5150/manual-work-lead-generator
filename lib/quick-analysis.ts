import { QuickScore } from "@/types";
import { callClaudeWithJson } from "./claude-utils";

// 簡易分析の入力データ
export interface QuickAnalysisInput {
  place_id: string;
  name: string;
  website: string;
  business_type: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

// 簡易分析の結果
export interface QuickAnalysisResult {
  place_id: string;
  quick_score: QuickScore;
  quick_reason: string;
}

// 一括分析の結果型
interface BatchAnalysisResponse {
  results: {
    place_id: string;
    score: number;
    reason: string;
  }[];
}

const DEFAULT_BATCH_RESULT: BatchAnalysisResponse = {
  results: [],
};

/**
 * 複数企業を一括で簡易分析する
 * コスト効率のため、1回のAPI呼び出しで全企業を判定
 */
export async function quickAnalyzeCompanies(
  companies: QuickAnalysisInput[]
): Promise<QuickAnalysisResult[]> {
  if (companies.length === 0) {
    return [];
  }

  // 企業情報をまとめてプロンプトに含める
  const companiesInfo = companies
    .map(
      (c, i) =>
        `[${i + 1}] place_id: ${c.place_id}
企業名: ${c.name}
HP: ${c.website}
業種: ${c.business_type || "不明"}
ページタイトル: ${c.meta_title || "取得できず"}
ページ説明: ${c.meta_description || "取得できず"}`
    )
    .join("\n\n");

  const prompt = `あなたは手作業代行サービスの営業担当です。以下の企業リストを分析し、手作業ニーズの可能性を3段階で評価してください。

【企業リスト】
${companiesInfo}

【評価基準】
★★★（score: 3）高い可能性:
- 物流・倉庫・製造・EC関連の企業
- ページ内容に「検品」「梱包」「仕分け」「発送」「軽作業」「手作業」などのキーワードあり
- 明確に手作業を必要とする事業内容

★★☆（score: 2）中程度:
- 事業内容から一定の手作業ニーズが推測できる
- 関連キーワードはないが業種から可能性あり
- B2B向けサービス業など

★☆☆（score: 1）低い:
- 手作業ニーズが低いか判断できない
- IT企業、コンサル、士業など
- 情報が不足している

以下の形式でJSONを返してください：
{
  "results": [
    {
      "place_id": "企業のplace_id",
      "score": 1-3の数値,
      "reason": "判定理由（20-30文字程度）"
    }
  ]
}

重要:
- 全企業について必ず結果を返してください
- place_idは入力そのままを返してください
- reasonは簡潔に（長くても50文字以内）

JSONのみを返してください。`;

  const response = await callClaudeWithJson<BatchAnalysisResponse>(
    prompt,
    2048,
    DEFAULT_BATCH_RESULT
  );

  // レスポンスを正規化
  const resultsMap = new Map(
    response.results.map((r) => [r.place_id, r])
  );

  // 入力企業の順序を維持しつつ結果を返す
  return companies.map((company) => {
    const result = resultsMap.get(company.place_id);
    if (result) {
      // スコアを1-3の範囲に正規化
      const normalizedScore = Math.max(1, Math.min(3, Math.round(result.score))) as QuickScore;
      return {
        place_id: company.place_id,
        quick_score: normalizedScore,
        quick_reason: result.reason,
      };
    }
    // 結果がない場合はデフォルト値
    return {
      place_id: company.place_id,
      quick_score: 1 as QuickScore,
      quick_reason: "分析できませんでした",
    };
  });
}
