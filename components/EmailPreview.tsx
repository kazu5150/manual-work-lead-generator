"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GeneratedEmail } from "@/types";
import { Mail, Copy, Download, Edit, Save } from "lucide-react";

interface EmailPreviewProps {
  email: GeneratedEmail;
  onSave?: (email: GeneratedEmail) => void;
}

export function EmailPreview({ email, onSave }: EmailPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `件名: ${subject}\n\n${body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave?.({ subject, body });
    setIsEditing(false);
  };

  const handleDownload = () => {
    const text = `件名: ${subject}\n\n${body}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `proposal_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            提案メールプレビュー
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4 mr-1" />
                保存
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-1" />
                編集
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">件名</label>
          {isEditing ? (
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          ) : (
            <div className="p-3 bg-muted rounded-md text-sm">{subject}</div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">本文</label>
          {isEditing ? (
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={15}
            />
          ) : (
            <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {body}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isEditing ? (
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            変更を保存
          </Button>
        ) : (
          <>
            <Button onClick={handleCopy} variant="outline" className="flex-1">
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "コピーしました!" : "コピー"}
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              ダウンロード
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
