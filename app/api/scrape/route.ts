import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite } from '@/lib/firecrawl';
import { extractServicesFromContent } from '@/lib/claude';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Scrape website with Firecrawl
    const scrapeResult = await scrapeWebsite(company.website);

    if (!scrapeResult.success) {
      return NextResponse.json(
        { error: scrapeResult.error || 'スクレイピングに失敗しました' },
        { status: 500 }
      );
    }

    // Extract services using Claude
    const services = await extractServicesFromContent(scrapeResult.content || '');

    // Analyze manual work potential
    const manualWorkPotential = services.length > 0
      ? `${services.join('、')}に関連する手作業の可能性があります`
      : 'HP内容から手作業関連の情報は特定できませんでした';

    // Save scraped data
    const { data: scrapedData, error: insertError } = await supabaseAdmin
      .from('scraped_data')
      .upsert({
        company_id: companyId,
        url: company.website,
        content: scrapeResult.content,
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

    // Update company status
    await supabaseAdmin
      .from('companies')
      .update({
        status: 'scraped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    return NextResponse.json({
      success: true,
      data: scrapedData,
      services,
      manualWorkPotential,
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
