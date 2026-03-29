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
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="flex items-center gap-3">
        <Code className="size-10 text-primary" />
        <h1 className="font-mono text-3xl font-bold">CodeTeacher</h1>
      </div>
      <p className="max-w-md text-center text-muted-foreground">
        プロジェクトを読み解く、あなたのレベルに合わせて。
        <br />
        フォルダを開くか、デモで機能を試してみましょう。
      </p>
      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={openFolder}>
          <FolderOpen className="size-4" />
          フォルダを開く
        </Button>
        <Button size="lg" onClick={loadDemo}>
          <Play className="size-4" />
          デモで試す
        </Button>
      </div>
    </div>
  );
}
