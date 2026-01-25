"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Company } from "@/types";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  ArrowRight,
  Building2,
} from "lucide-react";

interface CompanyCardProps {
  company: Company;
  showAnalysis?: boolean;
}

export function CompanyCard({ company, showAnalysis = false }: CompanyCardProps) {
  const getStatusBadge = (status: Company["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">未分析</Badge>;
      case "analyzed":
        return <Badge variant="warning">分析済（旧）</Badge>;
      case "scraped":
        return <Badge variant="default">HP分析済</Badge>;
      case "emailed":
        return <Badge variant="success">メール作成済</Badge>;
      default:
        return null;
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return null;
    if (score >= 70) return <Badge variant="success">高スコア: {score}</Badge>;
    if (score >= 40) return <Badge variant="warning">中スコア: {score}</Badge>;
    return <Badge variant="secondary">低スコア: {score}</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            {company.name}
          </CardTitle>
          <div className="flex gap-2">
            {getStatusBadge(company.status)}
            {showAnalysis && getScoreBadge(company.ai_score)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {company.address && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {company.address}
          </p>
        )}
        {company.phone && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {company.phone}
          </p>
        )}
        {company.website && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate max-w-[250px]"
            >
              {company.website}
            </a>
          </p>
        )}
        {company.rating && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            {company.rating.toFixed(1)}
          </p>
        )}
        {showAnalysis && company.ai_reason && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-sm">{company.ai_reason}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/details/${company.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            詳細を見る
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
