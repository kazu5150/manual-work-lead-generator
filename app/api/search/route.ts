import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/google-places';
import { supabaseAdmin } from '@/lib/supabase';

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

    // Search using Google Places API
    const places = await searchPlaces(keyword, location);

    // Filter out companies without website
    const placesWithWebsite = places.filter((place) => place.website);
    const excludedCount = places.length - placesWithWebsite.length;

    // Save to database (only companies with website)
    const companies = await Promise.all(
      placesWithWebsite.map(async (place) => {
        const companyData = {
          place_id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          phone: place.formatted_phone_number || null,
          website: place.website || null,
          rating: place.rating || null,
          business_type: businessType || null,
          search_keyword: keyword,
          search_area: location,
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
          console.error('Error saving company:', error);
          return null;
        }

        return data;
      })
    );

    const savedCompanies = companies.filter(Boolean);

    return NextResponse.json({
      success: true,
      count: savedCompanies.length,
      totalFound: places.length,
      excludedCount,
      companies: savedCompanies,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
