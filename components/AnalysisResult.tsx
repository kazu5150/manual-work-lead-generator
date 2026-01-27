"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult as AnalysisResultType } from "@/types";
import { Brain, Target, Lightbulb } from "lucide-react";

interface AnalysisResultProps {
  result: AnalysisResultType;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-green-100";
    if (score >= 40) return "bg-yellow-100";
    return "bg-gray-100";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5" />
          AI分析結果
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div
            className={`px-6 py-3 rounded-lg ${getScoreBg(result.score)} text-center`}
          >
            <p className="text-xs text-muted-foreground mb-1">スコア</p>
            <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}
              <span className="text-sm text-muted-foreground">/100</span>
            </p>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium flex items-center gap-2 mb-1">
              <Target className="h-4 w-4" />
              判定理由
            </p>
            <p className="text-sm text-muted-foreground">
              {result.reason}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">想定される手作業</p>
          <div className="flex flex-wrap gap-1.5">
            {result.manualWorkPotential.split(/[、,]/).map((work, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {work.trim()}
              </Badge>
            ))}
          </div>
        </div>

        {result.recommendedApproach && result.recommendedApproach !== "詳細はHP情報を取得してください" && (
          <div>
            <p className="text-sm font-medium flex items-center gap-2 mb-1">
              <Lightbulb className="h-4 w-4" />
              推奨アプローチ
            </p>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {result.recommendedApproach}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
