"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailPreview } from "@/components/EmailPreview";
import { useCompany } from "@/hooks/useCompany";
import { getScoreVariant } from "@/lib/constants";
import { GeneratedEmail } from "@/types";
import {
  ArrowLeft,
  Building2,
  Mail,
  Loader2,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

export default function ProposalPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const {
    company,
    proposal,
    loading,
    error: fetchError,
    refetch,
    setProposal,
  } = useCompany(companyId);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "メール生成に失敗しました");
      }

      setProposal(data.proposal);
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "メール生成中にエラーが発生しました");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (email: GeneratedEmail) => {
    if (!proposal) return;

    try {
      const response = await fetch("/api/generate-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          subject: email.subject,
          body: email.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "保存に失敗しました");
      }

      setProposal(data.proposal);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存中にエラーが発生しました");
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

  return (
    <div className="space-y-6">
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

      {saved && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="py-4 text-center text-green-700 flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" />
            保存しました
          </CardContent>
        </Card>
      )}

      {/* Company Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {company.name}
            </CardTitle>
            <Badge variant={getScoreVariant(company.ai_score)}>
              スコア: {company.ai_score || "-"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{company.address}</p>
          {company.ai_reason && (
            <p className="text-sm mt-2 p-2 bg-muted rounded-md">
              {company.ai_reason}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      {!proposal && (
        <Card>
          <CardContent className="py-8 text-center">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              AIを使用して提案メールを自動生成します
            </p>
            <Button onClick={handleGenerate} disabled={generating} size="lg">
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              提案メールを生成
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Email Preview */}
      {proposal && (
        <>
          <div className="flex items-center justify-end">
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              再生成
            </Button>
          </div>

          <EmailPreview
            email={{
              subject: proposal.subject || "",
              body: proposal.body || "",
            }}
            onSave={handleSave}
          />
        </>
      )}
    </div>
  );
}
