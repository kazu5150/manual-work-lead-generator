"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyCard } from "@/components/CompanyCard";
import { useCompanies } from "@/hooks/useCompany";
import { STATUS_CONFIG, CompanyStatus } from "@/lib/constants";
import { Building2, RefreshCw, Loader2 } from "lucide-react";

function CompaniesContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") as CompanyStatus | null;

  const { companies, loading, refetch } = useCompanies(status || undefined);

  const config = status ? STATUS_CONFIG[status] : null;
  const Icon = config?.icon || Building2;
  const title = config?.label || "全企業";
  const description = config?.description || "登録されているすべての企業";

  return (
    <div className="space-y-6">
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

      <div className="text-sm text-muted-foreground">
        {companies.length} 件の企業
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      ) : companies.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              showAnalysis={company.ai_score !== null}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">該当する企業がありません</p>
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
