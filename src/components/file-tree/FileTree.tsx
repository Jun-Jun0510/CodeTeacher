"use client";

import { BookOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectStore } from "@/store/projectStore";
import { FileTreeNode } from "./FileTreeNode";

export function FileTree() {
  const { fileTree, viewMode, setViewMode } = useProjectStore();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-3 py-2">
        <button
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1 text-sm hover:bg-accent"
          onClick={() => setViewMode("globalSummary")}
        >
          <BookOpen
            className={
              viewMode === "globalSummary"
                ? "size-4 text-primary"
                : "size-4 text-muted-foreground"
            }
          />
          <span
            className={
              viewMode === "globalSummary"
                ? "font-medium text-primary"
                : "text-muted-foreground"
            }
          >
            Global Summary
          </span>
        </button>
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-1">
          {fileTree.map((node) => (
            <FileTreeNode key={node.path} node={node} depth={0} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
