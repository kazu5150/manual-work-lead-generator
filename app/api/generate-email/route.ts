import { NextRequest, NextResponse } from 'next/server';
import { generateProposalEmail } from '@/lib/claude';
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

    // Get scraped data
    const { data: scrapedData } = await supabaseAdmin
      .from('scraped_data')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Create company info string
    const companyInfo = [
      company.address && `住所: ${company.address}`,
      company.phone && `電話: ${company.phone}`,
      company.business_type && `業種: ${company.business_type}`,
      company.ai_reason && `分析結果: ${company.ai_reason}`,
    ]
      .filter(Boolean)
      .join('\n');

    // Generate email with Claude
    const email = await generateProposalEmail(
      company.name,
      companyInfo,
      scrapedData?.content || '',
      scrapedData?.extracted_services || []
    );

    // Save proposal to database
    const { data: proposal, error: insertError } = await supabaseAdmin
      .from('proposals')
      .upsert({
        company_id: companyId,
        subject: email.subject,
        body: email.body,
        status: 'draft',
      }, {
        onConflict: 'company_id',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving proposal:', insertError);
      return NextResponse.json(
        { error: '提案の保存に失敗しました' },
        { status: 500 }
      );
    }

    // Update company status
    await supabaseAdmin
      .from('companies')
      .update({
        status: 'emailed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyId);

    return NextResponse.json({
      success: true,
      email,
      proposal,
    });
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: 'メール生成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Update proposal
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposalId, subject, body: emailBody, status } = body;

    if (!proposalId) {
      return NextResponse.json(
        { error: '提案IDは必須です' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (subject !== undefined) updateData.subject = subject;
    if (emailBody !== undefined) updateData.body = emailBody;
    if (status !== undefined) updateData.status = status;

    const { data: proposal, error } = await supabaseAdmin
      .from('proposals')
      .update(updateData)
      .eq('id', proposalId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '提案の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      proposal,
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    return NextResponse.json(
      { error: '提案の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// Get proposal for a company
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
      .from('proposals')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: '提案が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      proposal: data,
    });
  } catch (error) {
    console.error('Get proposal error:', error);
    return NextResponse.json(
      { error: '提案の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
