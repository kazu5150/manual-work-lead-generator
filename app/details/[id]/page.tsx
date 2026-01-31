"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult } from "@/components/AnalysisResult";
import { useCompany } from "@/hooks/useCompany";
import { STATUS_CONFIG, getScoreVariant } from "@/lib/constants";
import { AnalysisResult as AnalysisResultType, BUSINESS_TYPES } from "@/types";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Globe,
  Star,
  FileText,
  Loader2,
  Mail,
  ExternalLink,
  Search,
} from "lucide-react";

export default function CompanyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const {
    company,
    scrapedData,
    proposal,
    loading,
    error: fetchError,
    setCompany,
    setScrapedData,
  } = useCompany(companyId);

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setAnalyzeProgress("関連ページを検索中...");

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "HP分析に失敗しました");
      }

      setScrapedData(data.data);
      setCompany(data.company);
      setAnalyzeProgress(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "HP分析中にエラーが発生しました");
      setAnalyzeProgress(null);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">{fetchError || "企業が見つかりません"}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </CardContent>
      </Card>
    );
  }

  const analysisResult: AnalysisResultType | null =
    company.ai_score !== null
      ? {
          score: company.ai_score,
          partnerScore: company.partner_score ?? 0,
          companyType: company.company_type ?? "unknown",
          reason: company.ai_reason || "",
          manualWorkPotential: scrapedData?.manual_work_potential || "不明",
          recommendedApproach: "詳細はHP情報を取得してください",
        }
      : null;

  const statusConfig = STATUS_CONFIG[company.status];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        戻る
      </Button>

      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Company Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-6 w-6" />
                {company.name}
              </CardTitle>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant={statusConfig.badgeVariant}>
                  {statusConfig.label}
                </Badge>
                {company.company_type && (
                  <Badge variant={company.company_type === "partner" ? "default" : "secondary"}>
                    {company.company_type === "outsource" ? "外注検討企業" :
                     company.company_type === "partner" ? "パートナー候補" : "未分類"}
                  </Badge>
                )}
                {company.ai_score !== null && (
                  <Badge variant={getScoreVariant(company.ai_score)}>
                    外注ニーズ: {company.ai_score}
                  </Badge>
                )}
                {company.partner_score !== null && (
                  <Badge variant={getScoreVariant(company.partner_score)}>
                    パートナー: {company.partner_score}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {company.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {company.address}
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {company.phone}
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {company.website}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          {company.rating && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500" />
              {company.rating.toFixed(1)}
            </div>
          )}
          {(company.search_keyword || company.search_area || company.business_type) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>
                検索条件: {[
                  company.search_keyword,
                  company.search_area,
                  company.business_type && BUSINESS_TYPES.find(b => b.value === company.business_type)?.label
                ].filter(Boolean).join(" / ")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        {company.website && (
          <Button
            onClick={handleAnalyze}
            disabled={analyzing}
            variant={scrapedData ? "outline" : "default"}
            className="min-w-[180px]"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {analyzeProgress || "分析中..."}
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                {scrapedData ? "HP再分析" : "HP分析を実行"}
              </>
            )}
          </Button>
        )}

        {(company.status === "scraped" || company.status === "emailed") && (
          <Link href={`/proposal/${company.id}`}>
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              {proposal ? "メールを確認・編集" : "提案メール作成"}
            </Button>
          </Link>
        )}
      </div>

      {/* Analysis Result */}
      {analysisResult && <AnalysisResult result={analysisResult} />}

      {/* HP Info & Proposal - 2 column layout */}
      {(scrapedData || proposal) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scraped Data */}
          {scrapedData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  HP情報
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {scrapedData.extracted_services &&
                  scrapedData.extracted_services.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">抽出されたサービス</p>
                      <div className="flex flex-wrap gap-2">
                        {scrapedData.extracted_services.map((service, index) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {scrapedData.manual_work_potential && (
                  <div>
                    <p className="text-sm font-medium mb-2">手作業ポテンシャル</p>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      {scrapedData.manual_work_potential}
                    </p>
                  </div>
                )}

                {scrapedData.content && (
                  <div>
                    <p className="text-sm font-medium mb-2">HP内容（抜粋）</p>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                      {scrapedData.content.substring(0, 2000)}
                      {scrapedData.content.length > 2000 && "..."}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Proposal Preview */}
          {proposal && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  作成済みメール
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">件名</p>
                  <p className="text-sm bg-muted p-2 rounded-md">{proposal.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">本文</p>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                    {proposal.body}
                  </p>
                </div>
                <Link href={`/proposal/${company.id}`}>
                  <Button variant="outline" className="w-full">
                    詳細を見る・編集する
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
