"use client";

import { useState, useEffect, useCallback } from "react";
import { Company, ScrapedData, Proposal } from "@/types";

interface UseCompanyResult {
  company: Company | null;
  scrapedData: ScrapedData | null;
  proposal: Proposal | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setCompany: (company: Company | null) => void;
  setScrapedData: (data: ScrapedData | null) => void;
  setProposal: (proposal: Proposal | null) => void;
}

export function useCompany(companyId: string): UseCompanyResult {
  const [company, setCompany] = useState<Company | null>(null);
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch company
      const companyResponse = await fetch(`/api/companies?id=${companyId}`);
      const companyData = await companyResponse.json();

      if (!companyData.success || !companyData.company) {
        setError("企業が見つかりません");
        setLoading(false);
        return;
      }

      setCompany(companyData.company);

      // Try to fetch scraped data
      try {
        const scrapedResponse = await fetch(`/api/scrape?companyId=${companyId}`);
        const scrapedDataResult = await scrapedResponse.json();
        if (scrapedDataResult.success) {
          setScrapedData(scrapedDataResult.data);
        }
      } catch {
        // Scraped data might not exist yet
      }

      // Fetch proposal if status is emailed
      if (companyData.company.status === "emailed") {
        try {
          const proposalResponse = await fetch(`/api/generate-email?companyId=${companyId}`);
          const proposalData = await proposalResponse.json();
          if (proposalData.success && proposalData.proposal) {
            setProposal(proposalData.proposal);
          }
        } catch {
          // Proposal might not exist
        }
      }
    } catch {
      setError("企業データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    company,
    scrapedData,
    proposal,
    loading,
    error,
    refetch: fetchData,
    setCompany,
    setScrapedData,
    setProposal,
  };
}

interface UseCompaniesResult {
  companies: Company[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCompanies(status?: string): UseCompaniesResult {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/companies");
      const data = await response.json();

      if (data.success && data.companies) {
        let filtered = data.companies;
        if (status) {
          filtered = data.companies.filter((c: Company) => c.status === status);
        }
        setCompanies(filtered);
      }
    } catch {
      setError("企業一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    refetch: fetchCompanies,
  };
}
