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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI分析結果
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`p-4 rounded-lg ${getScoreBg(result.score)} text-center`}
        >
          <p className="text-sm text-muted-foreground mb-1">
            手作業ニーズスコア
          </p>
          <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}
            <span className="text-lg text-muted-foreground">/100</span>
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium flex items-center gap-2 mb-1">
              <Target className="h-4 w-4" />
              判定理由
            </p>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {result.reason}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">想定される手作業</p>
            <div className="flex flex-wrap gap-2">
              {result.manualWorkPotential.split(/[、,]/).map((work, index) => (
                <Badge key={index} variant="outline">
                  {work.trim()}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium flex items-center gap-2 mb-1">
              <Lightbulb className="h-4 w-4" />
              推奨アプローチ
            </p>
            <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              {result.recommendedApproach}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
