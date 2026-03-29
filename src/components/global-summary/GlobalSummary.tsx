"use client";

import { mockGlobalSummary } from "@/mock/mockGlobalSummary";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GlobalSummary() {
  const data = mockGlobalSummary;

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

        {/* Concepts */}
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
