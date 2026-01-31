import { NextRequest } from "next/server";
import { analyzeCompany, findRelevantUrls } from "@/lib/scrape-service";
import { supabaseAdmin } from "@/lib/supabase";
import { apiSuccess, apiError, ApiErrors } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      return apiError(ApiErrors.COMPANY_ID_REQUIRED.message, ApiErrors.COMPANY_ID_REQUIRED.status);
    }

    // Get company from database
    const { data: company, error: fetchError } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (fetchError || !company) {
      return apiError(ApiErrors.COMPANY_NOT_FOUND.message, ApiErrors.COMPANY_NOT_FOUND.status);
    }

    if (!company.website) {
      return apiError(ApiErrors.NO_WEBSITE.message, ApiErrors.NO_WEBSITE.status);
    }

    // Analyze company
    const analysisData = await analyzeCompany(company);

    if (!analysisData) {
      return apiError(ApiErrors.SCRAPE_FAILED.message, ApiErrors.SCRAPE_FAILED.status);
    }

    const { urls } = await findRelevantUrls(company.website);

    // Save scraped data
    const { data: scrapedData, error: insertError } = await supabaseAdmin
      .from("scraped_data")
      .upsert(
        {
          company_id: companyId,
          url: urls.join(", "),
          content: analysisData.content,
          extracted_services: analysisData.services,
          manual_work_potential: analysisData.manualWorkPotential,
        },
        { onConflict: "company_id" }
      )
      .select()
      .single();

    if (insertError) {
      console.error("Error saving scraped data:", insertError);
      return apiError(ApiErrors.SAVE_FAILED.message, ApiErrors.SAVE_FAILED.status);
    }

    // Update company with analysis results
    const { error: updateError } = await supabaseAdmin
      .from("companies")
      .update({
        ai_score: analysisData.analysis.score,
        ai_reason: analysisData.analysis.reason,
        partner_score: analysisData.analysis.partnerScore,
        company_type: analysisData.analysis.companyType,
        status: "scraped",
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyId);

    if (updateError) {
      console.error("Error updating company:", updateError);
    }

    // Get updated company
    const { data: updatedCompany } = await supabaseAdmin
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    return apiSuccess({
      data: scrapedData,
      company: updatedCompany,
      services: analysisData.services,
      analysis: analysisData.analysis,
      manualWorkPotential: analysisData.manualWorkPotential,
    }, analysisData.meta);
  } catch (error) {
    console.error("Scrape error:", error);
    return apiError("スクレイピング中にエラーが発生しました", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return apiError(ApiErrors.COMPANY_ID_REQUIRED.message, ApiErrors.COMPANY_ID_REQUIRED.status);
    }

    const { data, error } = await supabaseAdmin
      .from("scraped_data")
      .select("*")
      .eq("company_id", companyId)
      .single();

    if (error) {
      return apiError(ApiErrors.DATA_NOT_FOUND.message, ApiErrors.DATA_NOT_FOUND.status);
    }

    return apiSuccess({ data });
  } catch (error) {
    console.error("Get scraped data error:", error);
    return apiError(ApiErrors.FETCH_FAILED.message, ApiErrors.FETCH_FAILED.status);
  }
}
