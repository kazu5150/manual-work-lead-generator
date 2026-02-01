const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY!;
const FIRECRAWL_API_BASE = 'https://api.firecrawl.dev/v1';

export interface ScrapeResult {
  success: boolean;
  content?: string;
  markdown?: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
  };
  error?: string;
}

export interface SearchResult {
  success: boolean;
  urls: string[];
  error?: string;
}

export interface MapResult {
  success: boolean;
  urls: string[];
  error?: string;
}

export async function scrapeWebsite(url: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(`${FIRECRAWL_API_BASE}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to scrape website',
      };
    }

    return {
      success: true,
      content: data.data?.markdown || data.data?.content || '',
      markdown: data.data?.markdown,
      metadata: data.data?.metadata,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function crawlWebsite(
  url: string,
  maxPages: number = 5
): Promise<ScrapeResult[]> {
  try {
    // Start crawl
    const crawlResponse = await fetch(`${FIRECRAWL_API_BASE}/crawl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        limit: maxPages,
        scrapeOptions: {
          formats: ['markdown'],
          onlyMainContent: true,
        },
      }),
    });

    const crawlData = await crawlResponse.json();

    if (!crawlResponse.ok || !crawlData.success) {
      return [{
        success: false,
        error: crawlData.error || 'Failed to start crawl',
      }];
    }

    const jobId = crawlData.id;

    // Poll for results
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const statusResponse = await fetch(
        `${FIRECRAWL_API_BASE}/crawl/${jobId}`,
        {
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          },
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.status === 'completed') {
        return (statusData.data || []).map((page: { markdown?: string; content?: string; metadata?: object }) => ({
          success: true,
          content: page.markdown || page.content || '',
          markdown: page.markdown,
          metadata: page.metadata,
        }));
      }

      if (statusData.status === 'failed') {
        return [{
          success: false,
          error: 'Crawl job failed',
        }];
      }

      attempts++;
    }

    return [{
      success: false,
      error: 'Crawl job timed out',
    }];
  } catch (error) {
    return [{
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }];
  }
}

// Search API - サイト内で特定キーワードを含むページを検索
export async function searchWebsite(
  domain: string,
  keywords?: string[],
  limit: number = 5
): Promise<SearchResult> {
  // デフォルトキーワード
  const searchKeywords = keywords ?? ['手作業', '外注', '委託', '作業', 'サービス'];

  try {
    const query = `site:${domain} ${searchKeywords.join(' OR ')}`;

    const response = await fetch(`${FIRECRAWL_API_BASE}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        limit,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        urls: [],
        error: data.error || 'Search failed',
      };
    }

    // Extract URLs from search results
    const urls = (data.data || [])
      .map((result: { url?: string }) => result.url)
      .filter((url: string | undefined): url is string => !!url);

    return {
      success: true,
      urls,
    };
  } catch (error) {
    return {
      success: false,
      urls: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Map API - サイト内のURL一覧を取得し、関連ページをフィルタ
export async function mapWebsite(
  url: string,
  searchTerms?: string,
  limit: number = 10
): Promise<MapResult> {
  // デフォルト検索語句
  const search = searchTerms ?? 'サービス OR 事業 OR 会社概要 OR about OR service OR business';

  try {
    const response = await fetch(`${FIRECRAWL_API_BASE}/map`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        search,
        limit,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        urls: [],
        error: data.error || 'Map failed',
      };
    }

    return {
      success: true,
      urls: data.links || data.urls || [],
    };
  } catch (error) {
    return {
      success: false,
      urls: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 複数URLを一括スクレイプ
export async function scrapeMultipleUrls(urls: string[]): Promise<ScrapeResult[]> {
  const results = await Promise.all(
    urls.slice(0, 5).map(url => scrapeWebsite(url))
  );
  return results;
}

// メタデータのみ取得用の結果型
export interface MetadataResult {
  success: boolean;
  url: string;
  title?: string;
  description?: string;
  error?: string;
}

// 単一URLのメタデータのみ取得（軽量スクレイピング）
export async function scrapeMetadataOnly(url: string): Promise<MetadataResult> {
  try {
    const response = await fetch(`${FIRECRAWL_API_BASE}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: false,
        includeTags: ['title', 'meta'],
        excludeTags: ['script', 'style', 'nav', 'footer', 'header'],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        url,
        error: data.error || 'Failed to scrape metadata',
      };
    }

    return {
      success: true,
      url,
      title: data.data?.metadata?.title || '',
      description: data.data?.metadata?.description || '',
    };
  } catch (error) {
    return {
      success: false,
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// 複数URLのメタデータを一括取得
export async function scrapeMetadataMultiple(urls: string[]): Promise<MetadataResult[]> {
  const results = await Promise.all(
    urls.map(url => scrapeMetadataOnly(url))
  );
  return results;
}
