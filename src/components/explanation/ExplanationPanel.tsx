"use client";

import { List } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { mockExplanations } from "@/mock/mockExplanations";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import SectionBlock from "@/components/explanation/SectionBlock";
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

  const fileExplanation = mockExplanations.find(
    (e) => e.filePath === selectedFilePath
  );

  if (!selectedFilePath || !fileExplanation) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        解説データがありません
      </div>
    );
  }

  const explanations = fileExplanation.explanations;

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
