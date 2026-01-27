import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export function extractJson<T>(text: string, defaultValue: T): T {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

export async function callClaudeWithJson<T>(
  prompt: string,
  maxTokens: number,
  defaultValue: T
): Promise<T> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  return extractJson(responseText, defaultValue);
}
