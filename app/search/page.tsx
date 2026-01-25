"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/SearchForm";
import { CompanyCard } from "@/components/CompanyCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Company } from "@/types";
import { Search, Loader2, Brain, ArrowRight } from "lucide-react";
import Link from "next/link";

function SearchContent() {
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const keyword = searchParams.get("keyword");
  const location = searchParams.get("location");
  const businessType = searchParams.get("businessType");

  useEffect(() => {
    if (keyword && location) {
      performSearch();
    }
  }, [keyword, location, businessType]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    setAnalyzed(false);

    try {
      const params = new URLSearchParams({
        keyword: keyword!,
        location: location!,
        ...(businessType && { businessType }),
      });

      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "検索に失敗しました");
      }

      setCompanies(data.companies || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const analyzeAll = async () => {
    setLoading(true);
    setError(null);

    try {
      const companyIds = companies.map((c) => c.id);
      const response = await fetch("/api/analyze", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "分析に失敗しました");
      }

      // Refresh company data
      const refreshPromises = companies.map(async (company) => {
        const result = data.results.find((r: { companyId: string; success: boolean; analysis?: { score: number; reason: string } }) => r.companyId === company.id);
        if (result?.success) {
          return {
            ...company,
            ai_score: result.analysis?.score,
            ai_reason: result.analysis?.reason,
            status: "analyzed" as const,
          };
        }
        return company;
      });

      const updatedCompanies = await Promise.all(refreshPromises);
      setCompanies(updatedCompanies);
      setAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">企業検索</h1>
        <p className="text-muted-foreground mt-1">
          Google Places APIを使用して企業を検索します
        </p>
      </div>

      <SearchForm />

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">
              {analyzed ? "AI分析中..." : "検索中..."}
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-6 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {!loading && companies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              検索結果: {companies.length}件
            </h2>
            <div className="flex gap-2">
              {!analyzed && (
                <Button onClick={analyzeAll} disabled={loading}>
                  <Brain className="h-4 w-4 mr-2" />
                  全企業をAI分析
                </Button>
              )}
              {analyzed && (
                <Link href="/analysis">
                  <Button>
                    分析結果を見る
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                showAnalysis={analyzed}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && keyword && location && companies.length === 0 && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              検索条件に一致する企業が見つかりませんでした
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">企業検索</h1>
            <p className="text-muted-foreground mt-1">
              Google Places APIを使用して企業を検索します
            </p>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </CardContent>
          </Card>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
