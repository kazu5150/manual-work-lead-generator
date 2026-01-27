"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompanyCard } from "@/components/CompanyCard";
import { Company } from "@/types";
import {
  Search,
  Building2,
  Brain,
  Globe,
  Mail,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface Stats {
  total: number;
  pending: number;
  analyzed: number;
  scraped: number;
  emailed: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    analyzed: 0,
    scraped: 0,
    emailed: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState<Company[]>([]);
  const [highScoreCompanies, setHighScoreCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/companies");
      const data = await response.json();

      if (data.success && data.companies) {
        const companies = data.companies;

        // Calculate stats
        setStats({
          total: companies.length,
          pending: companies.filter((c: Company) => c.status === "pending").length,
          analyzed: companies.filter((c: Company) => c.status === "analyzed").length,
          scraped: companies.filter((c: Company) => c.status === "scraped").length,
          emailed: companies.filter((c: Company) => c.status === "emailed").length,
        });

        // Recent companies
        setRecentCompanies(companies.slice(0, 6));

        // High score companies
        const highScore = companies
          .filter((c: Company) => c.ai_score && c.ai_score >= 70)
          .sort((a: Company, b: Company) => (b.ai_score || 0) - (a.ai_score || 0))
          .slice(0, 6);
        setHighScoreCompanies(highScore);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statCards = [
    {
      title: "総企業数",
      value: stats.total,
      icon: Building2,
      color: "text-blue-600",
      href: "/companies",
    },
    {
      title: "未分析",
      value: stats.pending,
      icon: Search,
      color: "text-gray-600",
      href: "/companies?status=pending",
    },
    {
      title: "分析済み",
      value: stats.analyzed,
      icon: Brain,
      color: "text-yellow-600",
      href: "/companies?status=analyzed",
    },
    {
      title: "HP取得済み",
      value: stats.scraped,
      icon: Globe,
      color: "text-green-600",
      href: "/companies?status=scraped",
    },
    {
      title: "メール作成済み",
      value: stats.emailed,
      icon: Mail,
      color: "text-purple-600",
      href: "/companies?status=emailed",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ダッシュボード</h1>
          <p className="text-muted-foreground mt-1">
            顧客獲得の進捗を確認しましょう
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            更新
          </Button>
          <Link href="/search">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              新規検索
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* High Score Companies */}
      {highScoreCompanies.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Badge variant="success">高スコア</Badge>
              優先アプローチ企業
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highScoreCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                showAnalysis={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Companies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近追加された企業</h2>
          <Link href="/analysis">
            <Button variant="ghost" size="sm">
              すべて見る
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {recentCompanies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                まだ企業が登録されていません
              </p>
              <Link href="/search">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  企業を検索する
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Workflow Guide */}
      <Card>
        <CardHeader>
          <CardTitle>ワークフロー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                1
              </div>
              <div>
                <p className="font-medium">企業検索</p>
                <p className="text-sm text-muted-foreground">Google Places API</p>
              </div>
            </div>
            <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                2
              </div>
              <div>
                <p className="font-medium">AI分析</p>
                <p className="text-sm text-muted-foreground">Claude API</p>
              </div>
            </div>
            <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                3
              </div>
              <div>
                <p className="font-medium">HP情報取得</p>
                <p className="text-sm text-muted-foreground">Firecrawl API</p>
              </div>
            </div>
            <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                4
              </div>
              <div>
                <p className="font-medium">提案メール生成</p>
                <p className="text-sm text-muted-foreground">Claude API</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
