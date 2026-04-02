"use client";

import { useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { mockGlobalSummary } from "@/mock/mockGlobalSummary";
import { mockFileTree } from "@/mock/mockProject";
import { useProjectStore } from "@/store/projectStore";
import { useGlobalSummary } from "@/hooks/useGlobalSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GlobalSummary() {
  const fileTree = useProjectStore((s) => s.fileTree);
  const {
    globalSummary,
    globalSummaryLoading,
    globalSummaryError,
    generateGlobalSummary,
  } = useGlobalSummary();

  // Check if we're using the demo project
  const isDemo =
    fileTree.length > 0 &&
    fileTree[0]?.name === mockFileTree[0]?.name;

  // Auto-generate global summary when entering this view
  useEffect(() => {
    if (!isDemo) {
      generateGlobalSummary();
    }
  }, [isDemo, generateGlobalSummary]);

  // Use store data, fall back to mock for demo
  const data = globalSummary ?? (isDemo ? mockGlobalSummary : null);

  if (globalSummaryLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Global Summaryを生成中...
        </p>
      </div>
    );
  }

  if (globalSummaryError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-destructive">{globalSummaryError}</p>
        <Button variant="outline" size="sm" onClick={generateGlobalSummary}>
          <RefreshCw className="size-4" />
          再試行
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        プロジェクトデータがありません
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">
            {data.projectName}
          </h2>
          <p className="text-sm text-muted-foreground">{data.overview}</p>
          <div className="flex gap-2">
            <Badge variant="secondary">{data.language}</Badge>
            <Badge variant="secondary">{data.fileCount} ファイル</Badge>
            <Badge variant="secondary">{data.totalLines} 行</Badge>
          </div>
        </div>

        {/* Structure */}
        <Card>
          <CardHeader>
            <CardTitle>プロジェクト構造</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.structure.map((item) => (
                <div key={item.path} className="flex gap-3 text-sm">
                  <code className="shrink-0 text-blue-400">{item.path}</code>
                  <span className="text-muted-foreground">{item.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dependencies */}
        {data.dependencies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>依存関係</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.dependencies.map((dep) => (
                  <div key={dep.name} className="flex gap-3 text-sm">
                    <code className="shrink-0 font-medium text-emerald-400">
                      {dep.name}
                    </code>
                    <span className="text-muted-foreground">
                      {dep.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Concepts */}
        {data.concepts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>主要な概念</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-2 pr-4 font-medium text-foreground">
                        ソースコード
                      </th>
                      <th className="pb-2 pr-4 font-medium text-foreground">
                        概念
                      </th>
                      <th className="pb-2 font-medium text-foreground">説明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.concepts.map((concept, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 pr-4">
                          <code className="text-blue-400">{concept.source}</code>
                        </td>
                        <td className="py-2 pr-4 text-foreground">
                          {concept.target}
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {concept.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>概要説明</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data.overview}
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
