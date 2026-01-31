"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CompanyCard } from "@/components/CompanyCard";
import { CompanyTable } from "@/components/CompanyTable";
import { useCompanies } from "@/hooks/useCompany";
import { useCompanyFilters } from "@/hooks/useCompanyFilters";
import { STATUS_CONFIG, CompanyStatus } from "@/lib/constants";
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

const ITEMS_PER_PAGE_OPTIONS = [20, 50, 100];

function CompaniesContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as CompanyStatus | null;
  const { companies, loading, refetch } = useCompanies(status || undefined);

  const [viewMode, setViewMode] = useState<ViewMode>("card");

  const {
    searchQuery,
    statusFilter,
    keywordFilter,
    areaFilter,
    sortField,
    sortOrder,
    currentPage,
    itemsPerPage,
    uniqueKeywords,
    uniqueAreas,
    filteredCompanies,
    paginatedCompanies,
    totalPages,
    handleSearchChange,
    handleStatusFilterChange,
    handleKeywordFilterChange,
    handleAreaFilterChange,
    handleItemsPerPageChange,
    handleSort,
    setCurrentPage,
  } = useCompanyFilters({ companies, urlStatus: status });

  const config = status ? STATUS_CONFIG[status] : null;
  const Icon = config?.icon || Building2;
  const title = config?.label || "全企業";
  const description = config?.description || "登録されているすべての企業";

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
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="企業名・住所で検索..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          {!status && (
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as CompanyStatus | "all")}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">すべてのステータス</option>
              <option value="pending">{STATUS_CONFIG.pending.label}</option>
              <option value="scraped">{STATUS_CONFIG.scraped.label}</option>
              <option value="emailed">{STATUS_CONFIG.emailed.label}</option>
            </select>
          )}
          {uniqueKeywords.length > 0 && (
            <select
              value={keywordFilter}
              onChange={(e) => handleKeywordFilterChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">すべてのキーワード</option>
              {uniqueKeywords.map((keyword) => (
                <option key={keyword} value={keyword}>{keyword}</option>
              ))}
            </select>
          )}
          {uniqueAreas.length > 0 && (
            <select
              value={areaFilter}
              onChange={(e) => handleAreaFilterChange(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">すべてのエリア</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          )}
        </div>

        {/* View Options */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">表示:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}件</option>
              ))}
            </select>
          </div>
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
        {filteredCompanies.length} 件
        {searchQuery && " (検索結果)"}
        {filteredCompanies.length !== companies.length && ` / 全 ${companies.length} 件`}
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
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredCompanies.length}
              onPageChange={setCurrentPage}
            />
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

function Pagination({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
  );

  return (
    <div className="flex items-center justify-between pt-4">
      <div className="text-sm text-muted-foreground">
        {startItem} - {endItem} / {totalItems} 件
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {visiblePages.map((page, index, array) => {
            const prev = array[index - 1];
            const showEllipsis = prev && page - prev > 1;
            return (
              <span key={page} className="flex items-center">
                {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
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
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
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
