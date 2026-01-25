import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get all companies or single company by id
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const { data: company, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !company) {
        return NextResponse.json(
          { error: '企業が見つかりません' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, company });
    }

    const { data: companies, error } = await supabaseAdmin
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      companies: companies || [],
    });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { error: '企業の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
