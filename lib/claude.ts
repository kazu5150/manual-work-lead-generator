import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult, GeneratedEmail } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

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

// HP内容を元に企業を分析（精度向上版）
export async function analyzeCompanyWithContent(
  companyName: string,
  businessType: string,
  websiteContent: string,
  extractedServices: string[]
): Promise<AnalysisResult> {
  const prompt = `あなたは手作業代行サービスの営業担当です。以下の企業のHP内容を分析し、手作業（検品、梱包、仕分け、封入、組立など）を外注するニーズがあるかを判定してください。

企業名: ${companyName}
業種: ${businessType}
抽出済みサービス: ${extractedServices.length > 0 ? extractedServices.join(', ') : 'なし'}

HP内容:
${websiteContent.substring(0, 4000)}

以下の形式でJSONを返してください：
{
  "score": 0-100の数値（手作業外注ニーズの可能性スコア）,
  "reason": "判定理由の説明（HP内容から読み取れた具体的な根拠を含める）",
  "manualWorkPotential": "想定される手作業の種類（HP内容から特定できた具体的な作業）",
  "recommendedApproach": "アプローチ方法の提案（企業の特性に合わせた具体的な提案）"
}

判定基準：
- HPに物流・倉庫・配送に関する記載がある：検品・梱包・仕分けニーズが高い
- 製品の製造・加工を行っている：組立・検品ニーズがある可能性
- ECサイトや通販事業を運営：梱包・発送ニーズが高い
- 食品を扱っている：パッケージング・仕分けニーズがある可能性
- 印刷・DM事業：封入・発送作業ニーズが高い
- 人手不足・繁忙期に関する記載：外注ニーズが高い可能性

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
