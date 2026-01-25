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
