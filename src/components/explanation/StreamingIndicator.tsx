"use client";

import { Loader2 } from "lucide-react";

interface StreamingIndicatorProps {
  text?: string;
}

export function StreamingIndicator({ text }: StreamingIndicatorProps) {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>AI解説を生成中...</span>
      </div>
      {text && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground leading-relaxed max-h-64 overflow-auto">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
