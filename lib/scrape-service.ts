import {
  scrapeMultipleUrls,
  searchWebsite,
  mapWebsite,
  ScrapeResult,
} from "./firecrawl";
import {
  extractServicesFromContent,
  analyzeCompanyWithContent,
} from "./claude";
import { Company, AnalysisResult } from "@/types";
import {
  generateSearchKeywords,
  generateMapSearchTerms,
} from "./crawl-keywords";

export type ScrapeStrategy = "search" | "map" | "fallback";

export interface ScrapeStrategyResult {
  urls: string[];
  strategy: ScrapeStrategy;
}

export interface AnalysisData {
  content: string;
  services: string[];
  analysis: AnalysisResult;
  manualWorkPotential: string;
  meta: {
    searchMethod: ScrapeStrategy;
    pagesScraped: number;
    urlsFound: number;
  };
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

export interface FindRelevantUrlsOptions {
  businessType?: string | null;
  searchKeyword?: string | null;
}

export async function findRelevantUrls(
  website: string,
  options: FindRelevantUrlsOptions = {}
): Promise<ScrapeStrategyResult> {
  const domain = extractDomain(website);
  const { businessType, searchKeyword } = options;

  // 動的キーワード生成
  const searchKeywords = generateSearchKeywords(businessType, searchKeyword);
  const mapSearchTerms = generateMapSearchTerms(businessType, searchKeyword);

  console.log(`[Scrape] Using search keywords: ${searchKeywords.slice(0, 5).join(', ')}...`);
  console.log(`[Scrape] Using map search terms: ${mapSearchTerms.slice(0, 100)}...`);

  // Strategy 1: Search API
  console.log(`[Scrape] Step 1: Searching for relevant pages on ${domain}`);
  const searchResult = await searchWebsite(domain, searchKeywords);

  if (searchResult.success && searchResult.urls.length > 0) {
    console.log(
      `[Scrape] Found ${searchResult.urls.length} pages via Search API`
    );
    return { urls: searchResult.urls, strategy: "search" };
  }

  // Strategy 2: Map API
  console.log("[Scrape] Step 2: No search results, trying Map API");
  const mapResult = await mapWebsite(website, mapSearchTerms);

  if (mapResult.success && mapResult.urls.length > 0) {
    console.log(`[Scrape] Found ${mapResult.urls.length} pages via Map API`);
    return { urls: mapResult.urls, strategy: "map" };
  }

  // Fallback: Top page only
  console.log("[Scrape] Step 3: Falling back to top page only");
  return { urls: [website], strategy: "fallback" };
}

export function combineScrapedContent(scrapeResults: ScrapeResult[]): string {
  const successfulScrapes = scrapeResults.filter((r) => r.success && r.content);

  if (successfulScrapes.length === 0) {
    return "";
  }

  return successfulScrapes
    .map((r) => r.content)
    .join("\n\n---\n\n")
    .substring(0, 10000);
}

export async function analyzeCompany(
  company: Company
): Promise<AnalysisData | null> {
  if (!company.website) {
    return null;
  }

  // Step 1-3: Find relevant URLs with dynamic keywords based on company info
  const { urls, strategy } = await findRelevantUrls(company.website, {
    businessType: company.business_type,
    searchKeyword: company.search_keyword,
  });

  // Step 4: Scrape pages
  console.log(`[Scrape] Step 4: Scraping ${urls.length} pages`);
  const scrapeResults = await scrapeMultipleUrls(urls);

  // Combine content
  const combinedContent = combineScrapedContent(scrapeResults);
  if (!combinedContent) {
    return null;
  }

  const successfulScrapes = scrapeResults.filter((r) => r.success && r.content);

  // Step 5: Extract services with Claude
  console.log("[Scrape] Step 5: Extracting services with Claude");
  const services = await extractServicesFromContent(combinedContent);

  // Step 6: Analyze with Claude
  console.log("[Scrape] Step 6: Analyzing company with Claude");
  const analysis = await analyzeCompanyWithContent(
    company.name,
    company.business_type || "不明",
    combinedContent,
    services
  );

  // Generate manual work potential description
  const manualWorkPotential =
    services.length > 0
      ? `${services.join("、")}に関連する手作業の可能性があります。${analysis.manualWorkPotential}`
      : analysis.manualWorkPotential ||
        "HP内容から手作業関連の情報は特定できませんでした";

  return {
    content: combinedContent,
    services,
    analysis,
    manualWorkPotential,
    meta: {
      searchMethod: strategy,
      pagesScraped: successfulScrapes.length,
      urlsFound: urls.length,
    },
  };
}
