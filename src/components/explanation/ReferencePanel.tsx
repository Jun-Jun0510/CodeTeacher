"use client";

import { useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { detectConstructs } from "@/lib/constructDetector";
import { detectLanguage } from "@/lib/languageDetector";
import {
  supportedLanguages,
  categoryOrder,
  categoryLabels,
} from "@/data/reference";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { ReferenceCategory, DetectedConstruct } from "@/types/reference";

function ConstructEntry({ construct }: { construct: DetectedConstruct }) {
  const setHighlightedLines = useProjectStore((s) => s.setHighlightedLines);

  const handleClick = () => {
    setHighlightedLines(construct.lines);
    const el = document.getElementById(`line-${construct.firstLine}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div
      className="cursor-pointer rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-semibold text-blue-400">
          {construct.entry.keyword}
        </code>
        <span className="text-sm font-medium text-foreground">
          {construct.entry.title}
        </span>
        <Badge variant="secondary" className="ml-auto">
          {construct.lines.length}箇所
        </Badge>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {construct.entry.description}
      </p>
      <pre className="mt-2 rounded bg-muted/50 p-2 text-xs text-muted-foreground overflow-x-auto">
        {construct.entry.syntax}
      </pre>
    </div>
  );
}

export default function ReferencePanel() {
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const fileContents = useProjectStore((s) => s.fileContents);

  const language = selectedFilePath ? detectLanguage(selectedFilePath) : "";
  const code = selectedFilePath ? fileContents[selectedFilePath] ?? "" : "";

  const constructs = useMemo(
    () => detectConstructs(code, language),
    [code, language]
  );

  const grouped = useMemo(() => {
    const map = new Map<ReferenceCategory, DetectedConstruct[]>();
    for (const c of constructs) {
      const list = map.get(c.entry.category) ?? [];
      list.push(c);
      map.set(c.entry.category, list);
    }
    return map;
  }, [constructs]);

  if (!supportedLanguages.includes(language)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          この言語の構文リファレンスは未対応です
        </p>
        <p className="text-xs text-muted-foreground">
          対応言語: Python, C
        </p>
      </div>
    );
  }

  if (constructs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">
          検出された構文はありません
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 overflow-auto">
      <div className="space-y-3 p-4">
        {categoryOrder
          .filter((cat) => grouped.has(cat))
          .map((cat) => (
            <Collapsible key={cat} defaultOpen>
              <div className="rounded-lg border border-border">
                <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer hover:bg-muted/50 transition-colors">
                  {categoryLabels[cat]}
                  <Badge variant="outline" className="ml-auto">
                    {grouped.get(cat)!.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 px-4 pb-4">
                    {grouped.get(cat)!.map((c) => (
                      <ConstructEntry key={c.entry.keyword} construct={c} />
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
      </div>
    </ScrollArea>
  );
}
