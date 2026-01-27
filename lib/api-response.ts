import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ success: true, ...data, meta });
}

export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export const ApiErrors = {
  COMPANY_ID_REQUIRED: { message: "企業IDは必須です", status: 400 },
  COMPANY_NOT_FOUND: { message: "企業が見つかりません", status: 404 },
  NO_WEBSITE: { message: "ウェブサイトが登録されていません", status: 400 },
  SCRAPE_FAILED: { message: "スクレイピングに失敗しました", status: 500 },
  SAVE_FAILED: { message: "データの保存に失敗しました", status: 500 },
  FETCH_FAILED: { message: "データの取得中にエラーが発生しました", status: 500 },
  DATA_NOT_FOUND: { message: "データが見つかりません", status: 404 },
  EMAIL_GENERATION_FAILED: { message: "メール生成に失敗しました", status: 500 },
  UPDATE_FAILED: { message: "更新に失敗しました", status: 500 },
} as const;

export function apiErrorFromCode(
  code: keyof typeof ApiErrors
): ReturnType<typeof apiError> {
  const { message, status } = ApiErrors[code];
  return apiError(message, status);
}
