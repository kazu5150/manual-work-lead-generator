import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PreviewCompany } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const companies: PreviewCompany[] = body.companies;

    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json(
        { error: '保存する企業が選択されていません' },
        { status: 400 }
      );
    }

    // 選択された企業をDB保存
    const savedCompanies = await Promise.all(
      companies.map(async (company) => {
        const companyData = {
          place_id: company.place_id,
          name: company.name,
          address: company.address,
          phone: company.phone,
          website: company.website,
          rating: company.rating,
          business_type: company.business_type,
          search_keyword: company.search_keyword,
          search_area: company.search_area,
          quick_score: company.quick_score,
          quick_reason: company.quick_reason,
          meta_title: company.meta_title,
          meta_description: company.meta_description,
          status: 'pending' as const,
        };

        // Upsert to avoid duplicates
        const { data, error } = await supabaseAdmin
          .from('companies')
          .upsert(companyData, {
            onConflict: 'place_id',
            ignoreDuplicates: false,
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving company:', company.name, error);
          return null;
        }

        return data;
      })
    );

    const successfulSaves = savedCompanies.filter(Boolean);

    return NextResponse.json({
      success: true,
      savedCount: successfulSaves.length,
      companies: successfulSaves,
    });
  } catch (error) {
    console.error('Bulk save error:', error);
    return NextResponse.json(
      { error: '企業の保存中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
