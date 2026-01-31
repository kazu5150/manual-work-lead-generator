"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Company } from "@/types";
import { STATUS_CONFIG, getScoreVariant } from "@/lib/constants";
import { BUSINESS_TYPES } from "@/types";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  ArrowRight,
  Building2,
  Search,
} from "lucide-react";

interface CompanyCardProps {
  company: Company;
  showAnalysis?: boolean;
}

export function CompanyCard({ company, showAnalysis = false }: CompanyCardProps) {
  const statusConfig = STATUS_CONFIG[company.status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <span className="line-clamp-2">{company.name}</span>
        </CardTitle>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge variant={statusConfig.badgeVariant} className="whitespace-nowrap">
            {statusConfig.label}
          </Badge>
          {showAnalysis && company.company_type && (
            <Badge variant={company.company_type === "partner" ? "default" : "secondary"} className="whitespace-nowrap">
              {company.company_type === "outsource" ? "外注検討" :
               company.company_type === "partner" ? "パートナー" : "未分類"}
            </Badge>
          )}
          {showAnalysis && company.ai_score !== null && (
            <Badge variant={getScoreVariant(company.ai_score)} className="whitespace-nowrap">
              外注: {company.ai_score}
            </Badge>
          )}
          {showAnalysis && company.partner_score !== null && (
            <Badge variant={getScoreVariant(company.partner_score)} className="whitespace-nowrap">
              パートナー: {company.partner_score}
            </Badge>
          )}
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
        {(company.search_keyword || company.search_area || company.business_type) && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="truncate">
              {[
                company.search_keyword,
                company.search_area,
                company.business_type && BUSINESS_TYPES.find(b => b.value === company.business_type)?.label
              ].filter(Boolean).join(" / ")}
            </span>
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
