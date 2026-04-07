"use client";

import { useEffect, useState } from "react";
import { GitBranch, List, RefreshCw, Settings, X, Loader2 } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { useExplanation } from "@/hooks/useExplanation";
import { useFocusExplanation } from "@/hooks/useFocusExplanation";
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
import ReferencePanel from "@/components/explanation/ReferencePanel";
import ReactMarkdown from "react-markdown";
import { FlowchartDialog } from "@/components/explanation/FlowchartDialog";
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

function FocusExplanationBlock() {
  const focusedLines = useProjectStore((s) => s.focusedLines);
  const focusedExplanation = useProjectStore((s) => s.focusedExplanation);
  const focusedExplanationLoading = useProjectStore(
    (s) => s.focusedExplanationLoading
  );
  const focusedExplanationError = useProjectStore(
    (s) => s.focusedExplanationError
  );
  const setFocusedLines = useProjectStore((s) => s.setFocusedLines);
  const { retry } = useFocusExplanation();

  if (!focusedLines) return null;

  const label =
    focusedLines.start === focusedLines.end
      ? `L${focusedLines.start}`
      : `L${focusedLines.start}-${focusedLines.end}`;

  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/5">
      <div className="flex items-center justify-between border-b border-purple-500/20 px-4 py-2">
        <h3 className="text-sm font-medium text-purple-300">
          {label} のフォーカス解説
        </h3>
        <button
          onClick={() => setFocusedLines(null)}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="フォーカス解説を閉じる"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-4">
        {focusedExplanationError ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-destructive">
              {focusedExplanationError}
            </p>
            <Button variant="outline" size="sm" onClick={retry}>
              <RefreshCw className="size-4" />
              再試行
            </Button>
          </div>
        ) : focusedExplanationLoading && !focusedExplanation ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            解説を生成中...
          </div>
        ) : focusedExplanation ? (
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{focusedExplanation}</ReactMarkdown>
            {focusedExplanationLoading && (
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                生成中...
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ExplanationPanel() {
  const [flowchartOpen, setFlowchartOpen] = useState(false);
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const activeTab = useProjectStore((s) => s.activeTab);
  const setActiveTab = useProjectStore((s) => s.setActiveTab);
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

  const isReferenceTab = activeTab === "reference";

  // Determine the current tab value for the Tabs component
  const tabValue = isReferenceTab ? "reference" : activeLevel;

  const handleTabChange = (v: string) => {
    if (v === "reference") {
      setActiveTab("reference");
    } else {
      setActiveTab("explanation");
      setActiveLevel(v as ExplanationLevel);
    }
  };

  const renderSections = (level: LevelExplanation) => (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{level.summary}</p>
      {level.sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </div>
  );

  const renderExplanationContent = () => {
    if (isLoading) {
      return <StreamingIndicator text={streaming} />;
    }

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

    if (!explanations) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          解説データがありません
        </div>
      );
    }

    return (
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4 space-y-4">
          <FocusExplanationBlock />

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
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <Tabs
          value={tabValue}
          onValueChange={handleTabChange}
          className="flex-1"
        >
          <TabsList>
            {levelConfig.map((lc) => (
              <TabsTrigger key={lc.value} value={lc.value}>
                <span className={`size-2 rounded-full ${lc.dotColor}`} />
                {lc.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="reference">
              <span className="size-2 rounded-full bg-blue-500" />
              参照
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {!isReferenceTab && (
          <>
            <button
              onClick={() => setFlowchartOpen(true)}
              className="ml-2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="フローチャートを表示"
            >
              <GitBranch className="size-4" />
            </button>
            <button
              onClick={toggleExpandAllLevels}
              className={`ml-1 rounded-md p-1.5 transition-colors hover:bg-muted ${
                expandAllLevels ? "bg-muted text-foreground" : "text-muted-foreground"
              }`}
              title={expandAllLevels ? "アクティブレベルのみ表示" : "全レベル展開"}
            >
              <List className="size-4" />
            </button>
          </>
        )}
      </div>

      {isReferenceTab ? <ReferencePanel /> : renderExplanationContent()}

      <FlowchartDialog open={flowchartOpen} onOpenChange={setFlowchartOpen} />
    </div>
  );
}
