"use client";

import { Code, FolderOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/projectStore";
import { useFileSystem } from "@/hooks/useFileSystem";
import { mockFileTree, mockFileContents } from "@/mock/mockProject";

export function WelcomeView() {
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
    <div className="flex h-full flex-col items-center justify-center gap-4 p-3 sm:gap-6 sm:p-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <Code className="size-6 text-primary sm:size-10" />
        <h1 className="font-mono text-lg font-bold sm:text-3xl">CodeTeacher</h1>
      </div>
      <p className="max-w-md text-center text-xs text-muted-foreground sm:text-sm">
        プロジェクトを読み解く、あなたのレベルに合わせて。
        <br />
        フォルダを開くか、デモで機能を試してみましょう。
      </p>
      <div className="flex flex-col gap-2 w-full max-w-xs sm:flex-row sm:gap-3 sm:w-auto sm:max-w-none">
        <Button variant="outline" size="sm" onClick={openFolder} className="sm:size-auto sm:h-9">
          <FolderOpen className="size-4" />
          フォルダを開く
        </Button>
        <Button size="sm" onClick={loadDemo} className="sm:size-auto sm:h-9">
          <Play className="size-4" />
          デモで試す
        </Button>
      </div>
    </div>
  );
}
