"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, MapPin, Building2 } from "lucide-react";
import { BUSINESS_TYPES } from "@/types";

export function SearchForm() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword || !location) return;

    setIsLoading(true);

    const params = new URLSearchParams({
      keyword,
      location,
      ...(businessType && { businessType }),
    });

    router.push(`/search?${params.toString()}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          企業検索
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              キーワード
            </label>
            <Input
              placeholder="例: 物流 倉庫 梱包"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              エリア
            </label>
            <Input
              placeholder="例: 埼玉県 さいたま市"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">業種</label>
            <Select
              options={[
                { value: "", label: "すべての業種" },
                ...BUSINESS_TYPES.map((type) => ({
                  value: type.value,
                  label: type.label,
                })),
              ]}
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "検索中..." : "企業を検索"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
