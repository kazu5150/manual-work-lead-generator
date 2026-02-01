"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PreviewCompany } from "@/types";
import { StarRating } from "./StarRating";
import {
  MapPin,
  Phone,
  Globe,
  Star,
  Building2,
} from "lucide-react";

interface PreviewCompanyCardProps {
  company: PreviewCompany;
  onSelectionChange: (placeId: string, selected: boolean) => void;
}

export function PreviewCompanyCard({
  company,
  onSelectionChange,
}: PreviewCompanyCardProps) {
  return (
    <Card
      className={`transition-all ${
        company.selected
          ? "ring-2 ring-primary shadow-md"
          : "hover:shadow-md opacity-75"
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={company.selected}
            onCheckedChange={(checked) =>
              onSelectionChange(company.place_id, checked === true)
            }
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="line-clamp-2">{company.name}</span>
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              <StarRating score={company.quick_score} size="md" />
              <span className="text-sm text-muted-foreground">
                {company.quick_score === 3
                  ? "高い可能性"
                  : company.quick_score === 2
                  ? "中程度"
                  : "低い"}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {company.quick_reason && (
          <div className="p-2 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">{company.quick_reason}</p>
          </div>
        )}
        {company.address && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{company.address}</span>
          </p>
        )}
        {company.phone && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Phone className="h-4 w-4 flex-shrink-0" />
            {company.phone}
          </p>
        )}
        {company.website && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 flex-shrink-0" />
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
      </CardContent>
    </Card>
  );
}
