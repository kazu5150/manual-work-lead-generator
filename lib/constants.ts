import { Search, Globe, Mail, LucideIcon } from "lucide-react";
import { Company } from "@/types";

export type CompanyStatus = Company["status"];

export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  badgeVariant: "secondary" | "default" | "success";
  description: string;
}

export const STATUS_CONFIG: Record<CompanyStatus, StatusConfig> = {
  pending: {
    label: "未分析",
    icon: Search,
    color: "text-gray-600",
    badgeVariant: "secondary",
    description: "HP分析がまだ行われていない企業",
  },
  scraped: {
    label: "HP分析済",
    icon: Globe,
    color: "text-green-600",
    badgeVariant: "default",
    description: "HP情報を取得済みの企業",
  },
  emailed: {
    label: "メール作成済",
    icon: Mail,
    color: "text-purple-600",
    badgeVariant: "success",
    description: "提案メールを作成済みの企業",
  },
};

export function getScoreVariant(score: number | null): "success" | "warning" | "secondary" {
  if (score === null) return "secondary";
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "secondary";
}
