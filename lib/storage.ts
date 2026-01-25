import { Company, ScrapedData, Proposal } from '@/types';

// In-memory storage for development without Supabase
const companies: Map<string, Company> = new Map();
const scrapedDataStore: Map<string, ScrapedData> = new Map();
const proposalsStore: Map<string, Proposal> = new Map();

function generateId(): string {
  return crypto.randomUUID();
}

export const storage = {
  // Companies
  async getCompanies(): Promise<Company[]> {
    return Array.from(companies.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async getCompanyById(id: string): Promise<Company | null> {
    return companies.get(id) || null;
  },

  async getCompanyByPlaceId(placeId: string): Promise<Company | null> {
    return Array.from(companies.values()).find(c => c.place_id === placeId) || null;
  },

  async upsertCompany(data: Partial<Company> & { place_id: string; name: string }): Promise<Company> {
    const existing = await this.getCompanyByPlaceId(data.place_id);

    if (existing) {
      const updated: Company = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };
      companies.set(existing.id, updated);
      return updated;
    }

    const newCompany: Company = {
      id: generateId(),
      place_id: data.place_id,
      name: data.name,
      address: data.address || null,
      phone: data.phone || null,
      website: data.website || null,
      rating: data.rating || null,
      business_type: data.business_type || null,
      ai_score: data.ai_score || null,
      ai_reason: data.ai_reason || null,
      status: data.status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    companies.set(newCompany.id, newCompany);
    return newCompany;
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<Company | null> {
    const existing = companies.get(id);
    if (!existing) return null;

    const updated: Company = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };
    companies.set(id, updated);
    return updated;
  },

  // Scraped Data
  async getScrapedData(companyId: string): Promise<ScrapedData | null> {
    return scrapedDataStore.get(companyId) || null;
  },

  async upsertScrapedData(companyId: string, data: Partial<ScrapedData>): Promise<ScrapedData> {
    const existing = scrapedDataStore.get(companyId);

    if (existing) {
      const updated: ScrapedData = {
        ...existing,
        ...data,
      };
      scrapedDataStore.set(companyId, updated);
      return updated;
    }

    const newData: ScrapedData = {
      id: generateId(),
      company_id: companyId,
      url: data.url || null,
      content: data.content || null,
      extracted_services: data.extracted_services || null,
      manual_work_potential: data.manual_work_potential || null,
      created_at: new Date().toISOString(),
    };

    scrapedDataStore.set(companyId, newData);
    return newData;
  },

  // Proposals
  async getProposal(companyId: string): Promise<Proposal | null> {
    return proposalsStore.get(companyId) || null;
  },

  async upsertProposal(companyId: string, data: Partial<Proposal>): Promise<Proposal> {
    const existing = proposalsStore.get(companyId);

    if (existing) {
      const updated: Proposal = {
        ...existing,
        ...data,
      };
      proposalsStore.set(companyId, updated);
      return updated;
    }

    const newProposal: Proposal = {
      id: generateId(),
      company_id: companyId,
      subject: data.subject || null,
      body: data.body || null,
      status: data.status || 'draft',
      created_at: new Date().toISOString(),
    };

    proposalsStore.set(companyId, newProposal);
    return newProposal;
  },

  async updateProposal(id: string, data: Partial<Proposal>): Promise<Proposal | null> {
    const entry = Array.from(proposalsStore.entries()).find(([, p]) => p.id === id);
    if (!entry) return null;

    const [companyId, existing] = entry;
    const updated: Proposal = {
      ...existing,
      ...data,
    };
    proposalsStore.set(companyId, updated);
    return updated;
  },
};
