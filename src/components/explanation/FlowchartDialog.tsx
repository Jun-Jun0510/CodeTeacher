"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/projectStore";
import { fetchFlowchartStream, parseMermaidCode } from "@/lib/apiClient";

interface FlowchartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FlowchartDialog({ open, onOpenChange }: FlowchartDialogProps) {
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const fileContents = useProjectStore((s) => s.fileContents);
  const apiKey = useProjectStore((s) => s.apiKey);

  const cacheRef = useRef<Map<string, string>>(new Map());
  const [svgHtml, setSvgHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const generate = useCallback(
    async (filePath: string, useCache: boolean) => {
      const code = fileContents[filePath];
      if (!code) {
        setError("ファイルの内容が読み込まれていません");
        return;
      }

      if (!apiKey) {
        setError("APIキーが設定されていません。ヘッダーの設定ボタンから入力してください。");
        return;
      }

      if (useCache && cacheRef.current.has(filePath)) {
        await renderMermaid(cacheRef.current.get(filePath)!);
        return;
      }

      setLoading(true);
      setError("");
      setSvgHtml("");

      await fetchFlowchartStream(filePath, code, apiKey, {
        onText: () => {},
        onError: (err) => {
          setError(err);
          setLoading(false);
        },
        onDone: async (fullText) => {
          const mermaidCode = parseMermaidCode(fullText) ?? fullText.trim();
          cacheRef.current.set(filePath, mermaidCode);
          await renderMermaid(mermaidCode);
          setLoading(false);
        },
      });
    },
    [apiKey, fileContents]
  );

  async function renderMermaid(code: string) {
    try {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        flowchart: { useMaxWidth: true },
      });
      const id = `flowchart-${Date.now()}`;
      const { svg } = await mermaid.render(id, code);
      setSvgHtml(svg);
      setError("");
    } catch {
      setError("フローチャートのレンダリングに失敗しました。生成されたMermaidコードに問題がある可能性があります。");
    }
  }

  useEffect(() => {
    if (open && selectedFilePath) {
      generate(selectedFilePath, true);
    }
    if (!open) {
      setSvgHtml("");
      setError("");
      setLoading(false);
    }
  }, [open, selectedFilePath, generate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            フローチャート
            {selectedFilePath && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {selectedFilePath}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto min-h-[300px]">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              フローチャートを生成中...
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-destructive">{error}</p>
              {selectedFilePath && apiKey && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generate(selectedFilePath, false)}
                >
                  <RefreshCw className="size-4" />
                  再試行
                </Button>
              )}
            </div>
          ) : svgHtml ? (
            <div
              className="flex justify-center p-4 [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: svgHtml }}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
