"use client";

import { useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";
import { mockExplanations } from "@/mock/mockExplanations";
import {
  fetchExplanationStream,
  parseExplanationJSON,
} from "@/lib/apiClient";

export function useExplanation() {
  const apiKey = useProjectStore((s) => s.apiKey);
  const fileContents = useProjectStore((s) => s.fileContents);
  const explanationCache = useProjectStore((s) => s.explanationCache);
  const explanationLoading = useProjectStore((s) => s.explanationLoading);
  const explanationError = useProjectStore((s) => s.explanationError);
  const streamingText = useProjectStore((s) => s.streamingText);
  const setExplanationCache = useProjectStore((s) => s.setExplanationCache);
  const setExplanationLoading = useProjectStore((s) => s.setExplanationLoading);
  const setExplanationError = useProjectStore((s) => s.setExplanationError);
  const setStreamingText = useProjectStore((s) => s.setStreamingText);

  const getExplanation = useCallback(
    (filePath: string) => {
      // 1. Check cache
      if (explanationCache[filePath]) {
        return;
      }

      // 2. Check mock data
      const mock = mockExplanations.find((e) => e.filePath === filePath);
      if (mock) {
        setExplanationCache(filePath, mock.explanations);
        return;
      }

      // 3. Check API key
      if (!apiKey) {
        return; // UI will show the settings prompt
      }

      // 4. Check if already loading
      if (explanationLoading[filePath]) {
        return;
      }

      // 5. Get code content
      const code = fileContents[filePath];
      if (!code) {
        return;
      }

      // 6. Start API call
      setExplanationLoading(filePath, true);
      setExplanationError(filePath, "");
      setStreamingText(filePath, "");

      fetchExplanationStream(filePath, code, apiKey, {
        onText: (text) => {
          setStreamingText(filePath, text);
        },
        onError: (error) => {
          setExplanationError(filePath, error);
          setExplanationLoading(filePath, false);
          setStreamingText(filePath, "");
        },
        onDone: (fullText) => {
          const parsed = parseExplanationJSON(fullText);
          if (parsed) {
            setExplanationCache(filePath, parsed);
          } else {
            setExplanationError(filePath, "解説データの解析に失敗しました");
          }
          setExplanationLoading(filePath, false);
          setStreamingText(filePath, "");
        },
      });
    },
    [
      apiKey,
      fileContents,
      explanationCache,
      explanationLoading,
      setExplanationCache,
      setExplanationLoading,
      setExplanationError,
      setStreamingText,
    ]
  );

  return {
    getExplanation,
    explanationCache,
    explanationLoading,
    explanationError,
    streamingText,
  };
}
