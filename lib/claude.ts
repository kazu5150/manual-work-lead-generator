import { AnalysisResult, GeneratedEmail } from "@/types";
import { callClaudeWithJson } from "./claude-utils";

const DEFAULT_EMAIL: GeneratedEmail = {
  subject: "メール生成に失敗しました",
  body: "メール生成に失敗しました。再度お試しください。",
};

const DEFAULT_ANALYSIS: AnalysisResult = {
  score: 50,
  partnerScore: 50,
  companyType: "unknown",
  reason: "分析に失敗しました",
  manualWorkPotential: "不明",
  recommendedApproach: "直接お問い合わせください",
};

export async function generateProposalEmail(
  companyName: string,
  companyInfo: string,
  scrapedContent: string,
  services: string[]
): Promise<GeneratedEmail> {
  const prompt = `あなたは手作業代行サービスの営業担当です。以下の企業に向けた営業メールを作成してください。

企業名: ${companyName}
企業情報: ${companyInfo}
HP内容: ${scrapedContent.substring(0, 2000)}
想定サービス: ${services.join(", ")}

以下の形式でJSONを返してください：
{
  "subject": "メールの件名",
  "body": "メール本文"
}

メール作成のポイント：
1. 企業の事業内容に基づいた具体的な提案
2. 手作業代行によるメリット（コスト削減、品質向上、人手不足解消など）
3. 丁寧でありながら押し付けがましくないトーン
4. 問い合わせへの導線

JSONのみを返してください。`;

  const result = await callClaudeWithJson<GeneratedEmail>(
    prompt,
    2048,
    DEFAULT_EMAIL
  );

  // 会社名が含まれていない場合はデフォルトの件名を設定
  if (result.subject === DEFAULT_EMAIL.subject) {
    return {
      ...result,
      subject: `【手作業代行サービスのご案内】${companyName}様`,
    };
  }

  return result;
}

export async function analyzeCompanyWithContent(
  companyName: string,
  businessType: string,
  websiteContent: string,
  extractedServices: string[]
): Promise<AnalysisResult> {
  const prompt = `あなたは手作業代行サービスの営業担当です。以下の企業のHP内容を分析し、2つの観点から評価してください。

企業名: ${companyName}
業種: ${businessType}
抽出済みサービス: ${extractedServices.length > 0 ? extractedServices.join(", ") : "なし"}

HP内容:
${websiteContent.substring(0, 4000)}

以下の形式でJSONを返してください：
{
  "score": 0-100の数値（外注ニーズスコア：手作業を外注したいニーズの可能性）,
  "partnerScore": 0-100の数値（パートナーニーズスコア：繁忙期・大量案件時の外注パートナーとしてのニーズ）,
  "companyType": "outsource" | "partner" | "unknown"（企業タイプの分類）,
  "reason": "判定理由の説明（HP内容から読み取れた具体的な根拠を含める）",
  "manualWorkPotential": "想定される手作業の種類（HP内容から特定できた具体的な作業）",
  "recommendedApproach": "アプローチ方法の提案（企業タイプに合わせた具体的な提案）"
}

【外注ニーズスコア（score）の判定基準】
- HPに物流・倉庫・配送に関する記載がある：検品・梱包・仕分けニーズが高い
- 製品の製造・加工を行っている：組立・検品ニーズがある可能性
- ECサイトや通販事業を運営：梱包・発送ニーズが高い
- 食品を扱っている：パッケージング・仕分けニーズがある可能性
- 印刷・DM事業：封入・発送作業ニーズが高い
- 人手不足・繁忙期に関する記載：外注ニーズが高い可能性

【パートナーニーズスコア（partnerScore）の判定基準】
- 自社で手作業サービスを提供している企業：業界理解があり、品質要求も明確
- 物流センター・倉庫を運営：繁忙期のキャパ補完ニーズあり
- DM発送・EC物流代行を行っている：大量案件時のパートナーニーズあり
- 自社一貫体制を強調：キャパ超過時に外注パートナーを探す可能性
- 複数拠点・大規模運営：協力会社ネットワークを持つ可能性

【企業タイプ（companyType）の分類】
- "outsource": 手作業を外注したい企業（メーカー、小売、オフィス系など）
- "partner": 手作業を自社で行っており、繁忙期にパートナーが必要な企業（物流会社、代行業者など）
- "unknown": 判断が難しい場合

【recommendedApproachの書き分け】
- outsource企業: 「手作業をお任せください」「コスト削減・品質向上」の提案
- partner企業: 「繁忙期のキャパ補完パートナー」「協力会社として」の提案

JSONのみを返してください。`;

  return callClaudeWithJson<AnalysisResult>(prompt, 1024, DEFAULT_ANALYSIS);
}

export async function extractServicesFromContent(
  content: string
): Promise<string[]> {
  const prompt = `以下のウェブサイトのコンテンツから、手作業に関連するサービスや業務を抽出してください。

コンテンツ:
${content.substring(0, 3000)}

以下の形式でJSONを返してください：
{
  "services": ["サービス1", "サービス2", ...]
}

抽出対象：
- 検品、梱包、仕分け、封入、組立、ラベル貼り
- 倉庫作業、発送作業、ピッキング
- 軽作業、内職、手作業
- その他手作業に関連する業務

JSONのみを返してください。`;

  const result = await callClaudeWithJson<{ services: string[] }>(
    prompt,
    512,
    { services: [] }
  );

  return result.services || [];
}
