import { useState, useMemo } from "react";
import { Company } from "@/types";
import { CompanyStatus } from "@/lib/constants";

type SortField = "name" | "ai_score" | "status" | "created_at";
type SortOrder = "asc" | "desc";

interface UseCompanyFiltersProps {
  companies: Company[];
  urlStatus?: CompanyStatus | null;
}

export function useCompanyFilters({ companies, urlStatus }: UseCompanyFiltersProps) {
  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">("all");
  const [keywordFilter, setKeywordFilter] = useState<string>("all");
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [hideNoWebsite, setHideNoWebsite] = useState(true); // デフォルトでHP無し企業を非表示

  // Sort
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Get unique keywords and areas for filter options
  const { uniqueKeywords, uniqueAreas } = useMemo(() => {
    const keywords = new Set<string>();
    const areas = new Set<string>();
    companies.forEach((company) => {
      if (company.search_keyword) keywords.add(company.search_keyword);
      if (company.search_area) areas.add(company.search_area);
    });
    return {
      uniqueKeywords: Array.from(keywords).sort((a, b) => a.localeCompare(b, "ja")),
      uniqueAreas: Array.from(areas).sort((a, b) => a.localeCompare(b, "ja")),
    };
  }, [companies]);

  // Filter and sort companies
  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    // Hide companies without website
    if (hideNoWebsite) {
      result = result.filter((company) => company.website);
    }

    // Status filter (only if not filtered by URL)
    if (!urlStatus && statusFilter !== "all") {
      result = result.filter((company) => company.status === statusFilter);
    }

    // Keyword filter
    if (keywordFilter !== "all") {
      result = result.filter((company) => company.search_keyword === keywordFilter);
    }

    // Area filter
    if (areaFilter !== "all") {
      result = result.filter((company) => company.search_area === areaFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.address?.toLowerCase().includes(query) ||
          company.phone?.includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name, "ja");
          break;
        case "ai_score":
          const scoreA = a.ai_score ?? -1;
          const scoreB = b.ai_score ?? -1;
          comparison = scoreA - scoreB;
          break;
        case "status":
          const statusOrder = { pending: 0, scraped: 1, emailed: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [companies, urlStatus, hideNoWebsite, statusFilter, keywordFilter, areaFilter, searchQuery, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(start, start + itemsPerPage);
  }, [filteredCompanies, currentPage, itemsPerPage]);

  // Handlers with page reset
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: CompanyStatus | "all") => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleKeywordFilterChange = (value: string) => {
    setKeywordFilter(value);
    setCurrentPage(1);
  };

  const handleAreaFilterChange = (value: string) => {
    setAreaFilter(value);
    setCurrentPage(1);
  };

  const handleHideNoWebsiteChange = (value: boolean) => {
    setHideNoWebsite(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return {
    // State
    searchQuery,
    statusFilter,
    keywordFilter,
    areaFilter,
    hideNoWebsite,
    sortField,
    sortOrder,
    currentPage,
    itemsPerPage,
    // Derived
    uniqueKeywords,
    uniqueAreas,
    filteredCompanies,
    paginatedCompanies,
    totalPages,
    // Handlers
    handleSearchChange,
    handleStatusFilterChange,
    handleKeywordFilterChange,
    handleAreaFilterChange,
    handleHideNoWebsiteChange,
    handleItemsPerPageChange,
    handleSort,
    setCurrentPage,
  };
}
