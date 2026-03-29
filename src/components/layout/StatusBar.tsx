"use client";

import { useProjectStore } from "@/store/projectStore";
import { detectLanguage } from "@/lib/languageDetector";

export function StatusBar() {
  const { selectedFilePath, fileContents, viewMode } = useProjectStore();

  if (viewMode !== "code" || !selectedFilePath) {
    return (
      <footer className="flex h-7 items-center border-t border-border bg-muted px-4">
        <span className="text-xs text-muted-foreground">CodeTeacher</span>
      </footer>
    );
  }

  const content = fileContents[selectedFilePath] ?? "";
  const lineCount = content ? content.split("\n").length : 0;
  const language = detectLanguage(selectedFilePath.split("/").pop() ?? "");

  return (
    <footer className="flex h-7 items-center justify-between border-t border-border bg-muted px-4">
      <span className="text-xs text-muted-foreground">{selectedFilePath}</span>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">{language}</span>
        {lineCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {lineCount} 行
          </span>
        )}
      </div>
    </footer>
  );
}
