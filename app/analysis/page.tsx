"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { CompanyCard } from "@/components/CompanyCard";
import { Company } from "@/types";
import {
  Brain,
  Filter,
  RefreshCw,
  Loader2,
  ArrowUpDown,
} from "lucide-react";

type SortOption = "score_desc" | "score_asc" | "date_desc" | "date_asc";
type FilterOption = "all" | "high" | "medium" | "low";

export default function AnalysisPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("score_desc");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/companies");
      const data = await response.json();

      if (data.success && data.companies) {
        // Filter to only show analyzed companies
        const analyzedCompanies = data.companies.filter(
          (c: Company) => c.ai_score !== null
        );
        setCompanies(analyzedCompanies);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const sortedAndFilteredCompanies = () => {
    let result = [...companies];

    // Filter
    switch (filterBy) {
      case "high":
        result = result.filter((c) => c.ai_score && c.ai_score >= 70);
        break;
      case "medium":
        result = result.filter(
          (c) => c.ai_score && c.ai_score >= 40 && c.ai_score < 70
        );
        break;
      case "low":
        result = result.filter((c) => c.ai_score && c.ai_score < 40);
        break;
    }

    // Sort
    switch (sortBy) {
      case "score_desc":
        result.sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
        break;
      case "score_asc":
        result.sort((a, b) => (a.ai_score || 0) - (b.ai_score || 0));
        break;
      case "date_desc":
        result.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
      case "date_asc":
        result.sort(
          (a, b) =>
            new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        );
        break;
    }

    return result;
  };

  const stats = {
    total: companies.length,
    high: companies.filter((c) => c.ai_score && c.ai_score >= 70).length,
    medium: companies.filter(
      (c) => c.ai_score && c.ai_score >= 40 && c.ai_score < 70
    ).length,
    low: companies.filter((c) => c.ai_score && c.ai_score < 40).length,
  };

  const filteredCompanies = sortedAndFilteredCompanies();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8" />
            AI分析結果
          </h1>
          <p className="text-muted-foreground mt-1">
            企業の手作業ニーズをAIで分析した結果
          </p>
        </div>
        <Button variant="outline" onClick={fetchCompanies} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          更新
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            filterBy === "all" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setFilterBy("all")}
        >
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">全企業</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            filterBy === "high" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setFilterBy("high")}
        >
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.high}</p>
            <p className="text-sm text-muted-foreground">高スコア (70+)</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            filterBy === "medium" ? "ring-2 ring-yellow-500" : ""
          }`}
          onClick={() => setFilterBy("medium")}
        >
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
            <p className="text-sm text-muted-foreground">中スコア (40-69)</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            filterBy === "low" ? "ring-2 ring-gray-500" : ""
          }`}
          onClick={() => setFilterBy("low")}
        >
          <CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold text-gray-600">{stats.low}</p>
            <p className="text-sm text-muted-foreground">低スコア (-39)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select
            options={[
              { value: "score_desc", label: "スコア（高い順）" },
              { value: "score_asc", label: "スコア（低い順）" },
              { value: "date_desc", label: "更新日（新しい順）" },
              { value: "date_asc", label: "更新日（古い順）" },
            ]}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          />
        </div>
        {filterBy !== "all" && (
          <Badge
            variant="secondary"
            className="cursor-pointer"
            onClick={() => setFilterBy("all")}
          >
            <Filter className="h-3 w-3 mr-1" />
            フィルター解除
          </Badge>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">読み込み中...</p>
          </CardContent>
        </Card>
      ) : filteredCompanies.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              showAnalysis={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {companies.length === 0
                ? "分析済みの企業がありません"
                : "条件に一致する企業がありません"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
