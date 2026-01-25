import { NextRequest, NextResponse } from 'next/server';
import {
  scrapeWebsite,
  searchWebsite,
  mapWebsite,
  scrapeMultipleUrls,
} from '@/lib/firecrawl';
import { extractServicesFromContent, analyzeCompanyWithContent } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';

// ドメインをURLから抽出
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return NextResponse.json(
        { error: '企業IDは必須です' },
        { status: 400 }
      );
    }

    // Get company from database
    const { data: company, error: fetchError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (fetchError || !company) {
      return NextResponse.json(
        { error: '企業が見つかりません' },
        { status: 404 }
      );
    }

    if (!company.website) {
      return NextResponse.json(
        { error: 'ウェブサイトが登録されていません' },
        { status: 400 }
      );
    }

    const domain = extractDomain(company.website);
    let urlsToScrape: string[] = [];
    let searchMethod = 'none';

    // Step 1: Search API で関連ページを探す
    console.log(`[Scrape] Step 1: Searching for relevant pages on ${domain}`);
    const searchResult = await searchWebsite(domain);

    if (searchResult.success && searchResult.urls.length > 0) {
      urlsToScrape = searchResult.urls;
      searchMethod = 'search';
      console.log(`[Scrape] Found ${urlsToScrape.length} pages via Search API`);
    } else {
      // Step 2: Search で見つからない場合は Map API を使用
      console.log('[Scrape] Step 2: No search results, trying Map API');
      const mapResult = await mapWebsite(company.website);

      if (mapResult.success && mapResult.urls.length > 0) {
        urlsToScrape = mapResult.urls;
        searchMethod = 'map';
        console.log(`[Scrape] Found ${urlsToScrape.length} pages via Map API`);
      } else {
        // Step 3: 両方失敗した場合はトップページのみ
        console.log('[Scrape] Step 3: Falling back to top page only');
        urlsToScrape = [company.website];
        searchMethod = 'fallback';
      }
    }

    // Step 4: 関連ページをスクレイプ
    console.log(`[Scrape] Step 4: Scraping ${urlsToScrape.length} pages`);
    const scrapeResults = await scrapeMultipleUrls(urlsToScrape);

    // 成功したスクレイプ結果を結合
    const successfulScrapes = scrapeResults.filter(r => r.success && r.content);
    if (successfulScrapes.length === 0) {
      return NextResponse.json(
        { error: 'スクレイピングに失敗しました' },
        { status: 500 }
      );
    }

    // コンテンツを結合（最大10000文字）
    const combinedContent = successfulScrapes
      .map(r => r.content)
      .join('\n\n---\n\n')
      .substring(0, 10000);

    // Step 5: Claude API でサービス抽出
    console.log('[Scrape] Step 5: Extracting services with Claude');
    const services = await extractServicesFromContent(combinedContent);

    // Step 6: Claude API で分析（HP内容ベース）
    console.log('[Scrape] Step 6: Analyzing company with Claude');
    const analysis = await analyzeCompanyWithContent(
      company.name,
      company.business_type || '不明',
      combinedContent,
      services
    );

    // 手作業ポテンシャルの説明を生成
    const manualWorkPotential = services.length > 0
      ? `${services.join('、')}に関連する手作業の可能性があります。${analysis.manualWorkPotential}`
      : analysis.manualWorkPotential || 'HP内容から手作業関連の情報は特定できませんでした';

    // Save scraped data
    const { data: scrapedData, error: insertError } = await supabaseAdmin
      .from('scraped_data')
      .upsert({
        company_id: companyId,
        url: urlsToScrape.join(', '),
        content: combinedContent,
        extracted_services: services,
        manual_work_potential: manualWorkPotential,
      }, {
        onConflict: 'company_id',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving scraped data:', insertError);
      return NextResponse.json(
        { error: 'データの保存に失敗しました' },
        { status: 500 }
      );
    }

    // Update company with analysis results and status
    const { error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        ai_score: analysis.score,
        ai_reason: analysis.reason,
        status: 'scraped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    if (updateError) {
      console.error('Error updating company:', updateError);
    }

    // 更新後の企業データを取得
    const { data: updatedCompany } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    return NextResponse.json({
      success: true,
      data: scrapedData,
      company: updatedCompany,
      services,
      analysis,
      manualWorkPotential,
      meta: {
        searchMethod,
        pagesScraped: successfulScrapes.length,
        urlsFound: urlsToScrape.length,
      },
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json(
      { error: 'スクレイピング中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Get scraped data for a company
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { error: '企業IDは必須です' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('scraped_data')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'データが見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get scraped data error:', error);
    return NextResponse.json(
      { error: 'データの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
