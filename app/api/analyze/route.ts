import { NextRequest, NextResponse } from 'next/server';
import { analyzeCompany } from '@/lib/claude';
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

    // Create company info string for analysis
    const companyInfo = [
      company.address && `住所: ${company.address}`,
      company.phone && `電話: ${company.phone}`,
      company.website && `ウェブサイト: ${company.website}`,
      company.rating && `評価: ${company.rating}`,
    ]
      .filter(Boolean)
      .join('\n');

    // Analyze with Claude
    const analysis = await analyzeCompany(
      company.name,
      companyInfo,
      company.business_type || '不明'
    );

    // Update company with analysis results
    const { data: updatedCompany, error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        ai_score: analysis.score,
        ai_reason: analysis.reason,
        status: 'analyzed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating company:', updateError);
      return NextResponse.json(
        { error: '分析結果の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      analysis,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: '分析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Batch analyze multiple companies
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyIds } = body;

    if (!companyIds || !Array.isArray(companyIds)) {
      return NextResponse.json(
        { error: '企業IDの配列が必要です' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      companyIds.map(async (companyId: string) => {
        try {
          const { data: company } = await supabaseAdmin
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();

          if (!company) return { companyId, success: false, error: 'Not found' };

          const companyInfo = [
            company.address && `住所: ${company.address}`,
            company.phone && `電話: ${company.phone}`,
            company.website && `ウェブサイト: ${company.website}`,
          ]
            .filter(Boolean)
            .join('\n');

          const analysis = await analyzeCompany(
            company.name,
            companyInfo,
            company.business_type || '不明'
          );

          await supabaseAdmin
            .from('companies')
            .update({
              ai_score: analysis.score,
              ai_reason: analysis.reason,
              status: 'analyzed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', companyId);

          return { companyId, success: true, analysis };
        } catch {
          return { companyId, success: false, error: 'Analysis failed' };
        }
      })
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    return NextResponse.json(
      { error: 'バッチ分析中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
