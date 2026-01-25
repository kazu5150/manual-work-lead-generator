import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult, GeneratedEmail } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function analyzeCompany(
  companyName: string,
  companyInfo: string,
  businessType: string
): Promise<AnalysisResult> {
  const prompt = `あなたは手作業代行サービスの営業担当です。以下の企業情報を分析し、手作業（検品、梱包、仕分け、封入、組立など）を外注するニーズがあるかを判定してください。

企業名: ${companyName}
業種: ${businessType}
情報: ${companyInfo}

以下の形式でJSONを返してください：
{
  "score": 0-100の数値（手作業外注ニーズの可能性スコア）,
  "reason": "判定理由の説明",
  "manualWorkPotential": "想定される手作業の種類（例：検品作業、梱包作業など）",
  "recommendedApproach": "アプローチ方法の提案"
}

判定基準：
- 物流・倉庫業：検品・梱包・仕分けニーズが高い（スコア高め）
- 製造業：組立・検品ニーズがある可能性
- 小売・通販：EC梱包・発送ニーズが高い
- 食品加工：パッケージングニーズがある可能性
- 印刷業：封入・発送作業ニーズが高い

JSONのみを返してください。`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AnalysisResult;
    }
    throw new Error('No JSON found in response');
  } catch {
    return {
      score: 50,
      reason: '分析に失敗しました',
      manualWorkPotential: '不明',
      recommendedApproach: '直接お問い合わせください',
    };
  }
}

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
想定サービス: ${services.join(', ')}

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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as GeneratedEmail;
    }
    throw new Error('No JSON found in response');
  } catch {
    return {
      subject: `【手作業代行サービスのご案内】${companyName}様`,
      body: 'メール生成に失敗しました。再度お試しください。',
    };
  }
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

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result.services || [];
    }
    return [];
  } catch {
    return [];
  }
}
