import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/google-places';
import { scrapeMetadataMultiple } from '@/lib/firecrawl';
import { quickAnalyzeCompanies, QuickAnalysisInput } from '@/lib/quick-analysis';
import { PreviewCompany, QuickScore } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const location = searchParams.get('location');
    const businessType = searchParams.get('businessType');

    if (!keyword || !location) {
      return NextResponse.json(
        { error: 'キーワードとエリアは必須です' },
        { status: 400 }
      );
    }

    // Step 1: Google Places APIで企業検索
    const places = await searchPlaces(keyword, location);

    // Step 2: HP無し企業を除外
    const placesWithWebsite = places.filter((place) => place.website);
    const excludedCount = places.length - placesWithWebsite.length;

    if (placesWithWebsite.length === 0) {
      return NextResponse.json({
        success: true,
        companies: [],
        totalFound: places.length,
        excludedCount,
      });
    }

    // Step 3: 各企業のメタ情報を取得
    const websiteUrls = placesWithWebsite.map((p) => p.website!);
    const metadataResults = await scrapeMetadataMultiple(websiteUrls);

    // メタデータをplace_idでマッピング
    const metadataMap = new Map<string, { title: string | null; description: string | null }>();
    placesWithWebsite.forEach((place, index) => {
      const metadata = metadataResults[index];
      if (metadata?.success) {
        metadataMap.set(place.place_id, {
          title: metadata.title || null,
          description: metadata.description || null,
        });
      } else {
        metadataMap.set(place.place_id, { title: null, description: null });
      }
    });

    // Step 4: Claude で一括簡易判定
    const analysisInputs: QuickAnalysisInput[] = placesWithWebsite.map((place) => {
      const meta = metadataMap.get(place.place_id);
      return {
        place_id: place.place_id,
        name: place.name,
        website: place.website!,
        business_type: businessType || null,
        meta_title: meta?.title || null,
        meta_description: meta?.description || null,
      };
    });

    const analysisResults = await quickAnalyzeCompanies(analysisInputs);
    const analysisMap = new Map(analysisResults.map((r) => [r.place_id, r]));

    // Step 5: プレビュー用データを構築
    const previewCompanies: PreviewCompany[] = placesWithWebsite.map((place) => {
      const meta = metadataMap.get(place.place_id);
      const analysis = analysisMap.get(place.place_id);

      return {
        place_id: place.place_id,
        name: place.name,
        address: place.formatted_address || null,
        phone: place.formatted_phone_number || null,
        website: place.website || null,
        rating: place.rating || null,
        business_type: businessType || null,
        search_keyword: keyword,
        search_area: location,
        quick_score: (analysis?.quick_score || 1) as QuickScore,
        quick_reason: analysis?.quick_reason || '分析中',
        meta_title: meta?.title || null,
        meta_description: meta?.description || null,
        selected: analysis?.quick_score === 3, // 高評価は初期選択
      };
    });

    // スコアの高い順にソート
    previewCompanies.sort((a, b) => b.quick_score - a.quick_score);

    return NextResponse.json({
      success: true,
      companies: previewCompanies,
      totalFound: places.length,
      excludedCount,
    });
  } catch (error) {
    console.error('Search preview error:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
