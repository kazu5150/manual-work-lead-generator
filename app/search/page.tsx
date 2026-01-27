"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/SearchForm";
import { CompanyCard } from "@/components/CompanyCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Company } from "@/types";
import { Search, Loader2 } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <p className="text-muted-foreground">検索中...</p>
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
          <h2 className="text-xl font-semibold">
            検索結果: {companies.length}件
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
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
