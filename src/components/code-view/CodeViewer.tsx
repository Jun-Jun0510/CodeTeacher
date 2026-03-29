"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useProjectStore } from "@/store/projectStore";
import { detectLanguage } from "@/lib/languageDetector";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function CodeViewer() {
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const fileContents = useProjectStore((s) => s.fileContents);
  const highlightedLines = useProjectStore((s) => s.highlightedLines);

  if (!selectedFilePath) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        ファイルを選択してください
      </div>
    );
  }

  const code = fileContents[selectedFilePath] ?? "";
  const segments = selectedFilePath.split("/");
  const language = detectLanguage(selectedFilePath);
  const highlightSet = new Set(highlightedLines);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border px-4 py-2">
        <Breadcrumb>
          <BreadcrumbList>
            {segments.map((seg, i) => {
              const isLast = i === segments.length - 1;
              return (
                <BreadcrumbItem key={i}>
                  {i > 0 && <BreadcrumbSeparator />}
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground">
                      {seg}
                    </BreadcrumbPage>
                  ) : (
                    <span className="text-muted-foreground">{seg}</span>
                  )}
                </BreadcrumbItem>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          wrapLines
          lineProps={(lineNumber: number) => {
            const style: React.CSSProperties = { display: "block" };
            if (highlightSet.has(lineNumber)) {
              style.backgroundColor = "rgba(59,130,246,0.15)";
              style.borderLeft = "3px solid #3b82f6";
            }
            return {
              style,
              id: `line-${lineNumber}`,
            };
          }}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            fontSize: "0.875rem",
            minHeight: "100%",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
