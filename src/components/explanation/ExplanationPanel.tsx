"use client";

import { useEffect } from "react";
import { List, RefreshCw, Settings } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { useExplanation } from "@/hooks/useExplanation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import SectionBlock from "@/components/explanation/SectionBlock";
import { StreamingIndicator } from "@/components/explanation/StreamingIndicator";
import type { ExplanationLevel, LevelExplanation } from "@/types/explanation";

const levelConfig: {
  value: ExplanationLevel;
  label: string;
  dotColor: string;
}[] = [
  { value: "beginner", label: "初級", dotColor: "bg-green-500" },
  { value: "intermediate", label: "中級", dotColor: "bg-amber-500" },
  { value: "advanced", label: "上級", dotColor: "bg-red-500" },
];

export default function ExplanationPanel() {
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const activeLevel = useProjectStore((s) => s.activeLevel);
  const setActiveLevel = useProjectStore((s) => s.setActiveLevel);
  const expandAllLevels = useProjectStore((s) => s.expandAllLevels);
  const toggleExpandAllLevels = useProjectStore(
    (s) => s.toggleExpandAllLevels
  );
  const apiKey = useProjectStore((s) => s.apiKey);

  const {
    getExplanation,
    explanationCache,
    explanationLoading,
    explanationError,
    streamingText,
  } = useExplanation();

  // Auto-trigger explanation generation when file is selected
  useEffect(() => {
    if (selectedFilePath) {
      getExplanation(selectedFilePath);
    }
  }, [selectedFilePath, getExplanation]);

  if (!selectedFilePath) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        ファイルを選択してください
      </div>
    );
  }

  const isLoading = explanationLoading[selectedFilePath];
  const error = explanationError[selectedFilePath];
  const streaming = streamingText[selectedFilePath];
  const explanations = explanationCache[selectedFilePath];

  // Loading / Streaming state
  if (isLoading) {
    return <StreamingIndicator text={streaming} />;
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => getExplanation(selectedFilePath)}
        >
          <RefreshCw className="size-4" />
          再試行
        </Button>
      </div>
    );
  }

  // No API key set and no cached/mock data
  if (!explanations && !apiKey) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <Settings className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          AI解説を生成するには、ヘッダーの設定ボタンからAPIキーを入力してください
        </p>
      </div>
    );
  }

  // No data available yet (API key set but not yet loaded)
  if (!explanations) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        解説データがありません
      </div>
    );
  }

  const renderSections = (level: LevelExplanation) => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{level.summary}</p>
      {level.sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <Tabs
          value={activeLevel}
          onValueChange={(v) => setActiveLevel(v as ExplanationLevel)}
          className="flex-1"
        >
          <TabsList>
            {levelConfig.map((lc) => (
              <TabsTrigger key={lc.value} value={lc.value}>
                <span className={`size-2 rounded-full ${lc.dotColor}`} />
                {lc.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <button
          onClick={toggleExpandAllLevels}
          className={`ml-2 rounded-md p-1.5 transition-colors hover:bg-muted ${
            expandAllLevels ? "bg-muted text-foreground" : "text-muted-foreground"
          }`}
          title={expandAllLevels ? "アクティブレベルのみ表示" : "全レベル展開"}
        >
          <List className="size-4" />
        </button>
      </div>

      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          {expandAllLevels ? (
            levelConfig.map((lc) => (
              <Collapsible key={lc.value} defaultOpen>
                <div className="rounded-lg border border-border">
                  <CollapsibleTrigger className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer hover:bg-muted/50 transition-colors">
                    <span
                      className={`size-2 rounded-full ${lc.dotColor}`}
                    />
                    {lc.label}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4">
                      {renderSections(explanations[lc.value])}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          ) : (
            renderSections(explanations[activeLevel])
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
