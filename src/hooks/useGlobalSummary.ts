"use client";

import { useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";
import {
  fetchGlobalSummaryStream,
  parseGlobalSummaryJSON,
} from "@/lib/apiClient";
import type { FileNode } from "@/types/fileTree";

function buildFileStructureText(nodes: FileNode[], prefix = ""): string {
  let result = "";
  for (const node of nodes) {
    result += `${prefix}${node.name}${node.type === "directory" ? "/" : ""}\n`;
    if (node.children) {
      result += buildFileStructureText(node.children, prefix + "  ");
    }
  }
  return result;
}

function collectSampleContents(
  fileContents: Record<string, string>,
  maxFiles = 5,
  maxLinesPerFile = 50
): string {
  const entries = Object.entries(fileContents).slice(0, maxFiles);
  return entries
    .map(([path, content]) => {
      const lines = content.split("\n").slice(0, maxLinesPerFile);
      const truncated =
        content.split("\n").length > maxLinesPerFile ? "\n// ..." : "";
      return `### ${path}\n\`\`\`\n${lines.join("\n")}${truncated}\n\`\`\``;
    })
    .join("\n\n");
}

export function useGlobalSummary() {
  const apiKey = useProjectStore((s) => s.apiKey);
  const fileTree = useProjectStore((s) => s.fileTree);
  const fileContents = useProjectStore((s) => s.fileContents);
  const globalSummary = useProjectStore((s) => s.globalSummary);
  const globalSummaryLoading = useProjectStore((s) => s.globalSummaryLoading);
  const globalSummaryError = useProjectStore((s) => s.globalSummaryError);
  const setGlobalSummary = useProjectStore((s) => s.setGlobalSummary);
  const setGlobalSummaryLoading = useProjectStore(
    (s) => s.setGlobalSummaryLoading
  );
  const setGlobalSummaryError = useProjectStore(
    (s) => s.setGlobalSummaryError
  );

  const generateGlobalSummary = useCallback(() => {
    if (globalSummary || globalSummaryLoading || !apiKey) {
      return;
    }

    const fileStructure = buildFileStructureText(fileTree);
    const sampleContents = collectSampleContents(fileContents);

    if (!fileStructure.trim()) {
      return;
    }

    setGlobalSummaryLoading(true);
    setGlobalSummaryError("");

    fetchGlobalSummaryStream(fileStructure, sampleContents, apiKey, {
      onText: () => {
        // streaming text not displayed for global summary
      },
      onError: (error) => {
        setGlobalSummaryError(error);
        setGlobalSummaryLoading(false);
      },
      onDone: (fullText) => {
        const parsed = parseGlobalSummaryJSON(fullText);
        if (parsed) {
          setGlobalSummary(parsed);
        } else {
          setGlobalSummaryError("Global Summaryの解析に失敗しました");
        }
        setGlobalSummaryLoading(false);
      },
    });
  }, [
    apiKey,
    fileTree,
    fileContents,
    globalSummary,
    globalSummaryLoading,
    setGlobalSummary,
    setGlobalSummaryLoading,
    setGlobalSummaryError,
  ]);

  return {
    globalSummary,
    globalSummaryLoading,
    globalSummaryError,
    generateGlobalSummary,
  };
}
