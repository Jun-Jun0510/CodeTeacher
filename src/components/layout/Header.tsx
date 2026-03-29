"use client";

import { Code, FolderOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/projectStore";
import { useFileSystem } from "@/hooks/useFileSystem";
import { mockFileTree, mockFileContents } from "@/mock/mockProject";

export function Header() {
  const { setFileTree, setFileContent, setViewMode } = useProjectStore();
  const { openFolder } = useFileSystem();

  const loadDemo = () => {
    setFileTree(mockFileTree);
    for (const [path, content] of Object.entries(mockFileContents)) {
      setFileContent(path, content);
    }
    setViewMode("code");
  };

  return (
    <header className="flex h-11 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        <Code className="size-5 text-primary" />
        <span className="font-mono font-bold text-sm">CodeTeacher</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={openFolder}>
          <FolderOpen className="size-4" />
          <span className="hidden sm:inline">フォルダを開く</span>
        </Button>
        <Button variant="outline" size="sm" onClick={loadDemo}>
          <Play className="size-4" />
          <span className="hidden sm:inline">デモで試す</span>
        </Button>
      </div>
    </header>
  );
}
