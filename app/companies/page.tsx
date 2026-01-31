"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyCard } from "@/components/CompanyCard";
import { CompanyTable } from "@/components/CompanyTable";
import { useCompanies } from "@/hooks/useCompany";
import { STATUS_CONFIG, CompanyStatus } from "@/lib/constants";
import { Company } from "@/types";
import {
  Building2,
  RefreshCw,
  Loader2,
  LayoutGrid,
  List,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type ViewMode = "card" | "table";
type SortField = "name" | "ai_score" | "status" | "created_at";
type SortOrder = "asc" | "desc";

const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100];

function CompaniesContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as CompanyStatus | null;

  const { companies, loading, refetch } = useCompanies(status || undefined);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Status filter (separate from URL param)
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | "all">("all");

  // Sort
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const config = status ? STATUS_CONFIG[status] : null;
  const Icon = config?.icon || Building2;
  const title = config?.label || "全企業";
  const description = config?.description || "登録されているすべての企業";

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    let result = [...companies];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((company) => company.status === statusFilter);
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
  }, [companies, statusFilter, searchQuery, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCompanies.length / itemsPerPage);
  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCompanies.slice(start, start + itemsPerPage);
  }, [filteredAndSortedCompanies, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: CompanyStatus | "all") => {
    setStatusFilter(value);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Icon className={`h-8 w-8 ${config?.color || "text-blue-600"}`} />
            {title}
          </h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          更新
        </Button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search and Status Filter */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="企業名・住所で検索..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* Status Filter - only show when not filtered by URL */}
          {!status && (
            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilterChange(e.target.value as CompanyStatus | "all")
              }
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">すべてのステータス</option>
              <option value="pending">{STATUS_CONFIG.pending.label}</option>
              <option value="scraped">{STATUS_CONFIG.scraped.label}</option>
              <option value="emailed">{STATUS_CONFIG.emailed.label}</option>
            </select>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Items per page */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">表示:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}件
                </option>
              ))}
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("card")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedCompanies.length} 件
        {searchQuery && ` (検索結果)`}
        {filteredAndSortedCompanies.length !== companies.length &&
          ` / 全 ${companies.length} 件`}
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      ) : paginatedCompanies.length > 0 ? (
        <>
          {viewMode === "card" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  showAnalysis={company.ai_score !== null}
                />
              ))}
            </div>
          ) : (
            <CompanyTable
              companies={paginatedCompanies}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredAndSortedCompanies.length)}{" "}
                / {filteredAndSortedCompanies.length} 件
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      // Show first, last, and pages around current
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      // Add ellipsis
                      const prev = array[index - 1];
                      const showEllipsis = prev && page - prev > 1;
                      return (
                        <span key={page} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        </span>
                      );
                    })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "検索条件に該当する企業がありません" : "該当する企業がありません"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CompaniesContent />
    </Suspense>
  );
}
