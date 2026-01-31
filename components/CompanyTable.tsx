"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Company } from "@/types";
import { STATUS_CONFIG, getScoreVariant } from "@/lib/constants";
import { ArrowUpDown, ExternalLink, Eye } from "lucide-react";

type SortField = "name" | "ai_score" | "status" | "created_at";
type SortOrder = "asc" | "desc";

interface CompanyTableProps {
  companies: Company[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export function CompanyTable({
  companies,
  sortField,
  sortOrder,
  onSort,
}: CompanyTableProps) {
  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=active]:bg-accent"
      onClick={() => onSort(field)}
      data-state={sortField === field ? "active" : undefined}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
      {sortField === field && (
        <span className="ml-1 text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
      )}
    </Button>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <SortButton field="name">企業名</SortButton>
            </TableHead>
            <TableHead className="hidden md:table-cell">住所</TableHead>
            <TableHead className="hidden lg:table-cell">電話番号</TableHead>
            <TableHead>
              <SortButton field="ai_score">スコア</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="status">ステータス</SortButton>
            </TableHead>
            <TableHead className="hidden sm:table-cell">HP</TableHead>
            <TableHead className="hidden lg:table-cell">キーワード</TableHead>
            <TableHead className="hidden lg:table-cell">エリア</TableHead>
            <TableHead className="w-[80px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                該当する企業がありません
              </TableCell>
            </TableRow>
          ) : (
            companies.map((company) => {
              const statusConfig = STATUS_CONFIG[company.status];
              return (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <span className="line-clamp-1">{company.name}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="line-clamp-1 text-sm text-muted-foreground">
                      {company.address || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {company.phone || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {company.ai_score !== null ? (
                      <Badge variant={getScoreVariant(company.ai_score)}>
                        {company.ai_score}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.badgeVariant}>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {company.search_keyword || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {company.search_area || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link href={`/details/${company.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
