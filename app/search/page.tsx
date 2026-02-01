"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SearchForm } from "@/components/SearchForm";
import { PreviewCompanyCard } from "@/components/PreviewCompanyCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PreviewCompany } from "@/types";
import { Search, Loader2, Save, CheckSquare, Square } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [previewCompanies, setPreviewCompanies] = useState<PreviewCompany[]>([]);
  const [searchStats, setSearchStats] = useState<{
    totalFound: number;
    excludedCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const keyword = searchParams.get("keyword");
  const location = searchParams.get("location");
  const businessType = searchParams.get("businessType");

  useEffect(() => {
    if (keyword && location) {
      performSearchPreview();
    }
  }, [keyword, location, businessType]);

  const performSearchPreview = async () => {
    setLoading(true);
    setError(null);
    setSearchStats(null);
    setPreviewCompanies([]);

    try {
      const params = new URLSearchParams({
        keyword: keyword!,
        location: location!,
        ...(businessType && { businessType }),
      });

      const response = await fetch(`/api/search-preview?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "検索に失敗しました");
      }

      setPreviewCompanies(data.companies || []);
      setSearchStats({
        totalFound: data.totalFound || 0,
        excludedCount: data.excludedCount || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索中にエラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectionChange = (placeId: string, selected: boolean) => {
    setPreviewCompanies((prev) =>
      prev.map((c) =>
        c.place_id === placeId ? { ...c, selected } : c
      )
    );
  };

  const handleSelectAll = () => {
    setPreviewCompanies((prev) => prev.map((c) => ({ ...c, selected: true })));
  };

  const handleDeselectAll = () => {
    setPreviewCompanies((prev) => prev.map((c) => ({ ...c, selected: false })));
  };

  const handleSaveSelected = async () => {
    const selectedCompanies = previewCompanies.filter((c) => c.selected);
    if (selectedCompanies.length === 0) {
      setError("保存する企業を選択してください");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/companies/bulk-save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companies: selectedCompanies }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "保存に失敗しました");
      }

      // 保存成功後、企業一覧ページへ遷移
      router.push("/companies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存中にエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = previewCompanies.filter((c) => c.selected).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">企業検索</h1>
        <p className="text-muted-foreground mt-1">
          キーワードと地域から新規開拓先を検索します
        </p>
      </div>

      <SearchForm />

      {loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">検索・AI分析中...</p>
            <p className="text-sm text-muted-foreground mt-2">
              企業情報の取得と簡易AI分析を行っています
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

      {!loading && previewCompanies.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                検索結果: {previewCompanies.length}件
                {searchStats && searchStats.excludedCount > 0 && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    （HP無し {searchStats.excludedCount}件 除外）
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                保存する企業を選択してください（{selectedCount}件選択中）
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={saving}
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                全選択
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={saving}
              >
                <Square className="h-4 w-4 mr-1" />
                全解除
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewCompanies.map((company) => (
              <PreviewCompanyCard
                key={company.place_id}
                company={company}
                onSelectionChange={handleSelectionChange}
              />
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleSaveSelected}
              disabled={saving || selectedCount === 0}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  選択した{selectedCount}件を保存
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {!loading && keyword && location && previewCompanies.length === 0 && !error && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchStats && searchStats.excludedCount > 0 ? (
                <>
                  {searchStats.totalFound}件見つかりましたが、すべてHP無しのため除外されました
                </>
              ) : (
                <>検索条件に一致する企業が見つかりませんでした</>
              )}
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
              キーワードと地域から新規開拓先を検索します
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
