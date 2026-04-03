"use client";

import { useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";
import { fetchFocusExplanationStream } from "@/lib/apiClient";

export function useFocusExplanation() {
  const focusedLines = useProjectStore((s) => s.focusedLines);
  const activeLevel = useProjectStore((s) => s.activeLevel);
  const selectedFilePath = useProjectStore((s) => s.selectedFilePath);
  const fileContents = useProjectStore((s) => s.fileContents);
  const apiKey = useProjectStore((s) => s.apiKey);
  const setFocusedExplanation = useProjectStore(
    (s) => s.setFocusedExplanation
  );
  const setFocusedExplanationLoading = useProjectStore(
    (s) => s.setFocusedExplanationLoading
  );
  const setFocusedExplanationError = useProjectStore(
    (s) => s.setFocusedExplanationError
  );

  const cacheRef = useRef<Map<string, string>>(new Map());
  const abortRef = useRef(false);

  const retry = useCallback(() => {
    const lines = useProjectStore.getState().focusedLines;
    const path = useProjectStore.getState().selectedFilePath;
    const level = useProjectStore.getState().activeLevel;
    if (!lines || !path) return;

    const key = `${path}:${lines.start}-${lines.end}:${level}`;
    cacheRef.current.delete(key);

    // Re-trigger by clearing and setting state
    setFocusedExplanation(null);
    setFocusedExplanationError("");
    setFocusedExplanationLoading(false);

    // Force re-trigger effect by toggling lines
    const store = useProjectStore.getState();
    store.setFocusedLines(null);
    // Use microtask to ensure state update propagates
    queueMicrotask(() => {
      store.setFocusedLines(lines);
    });
  }, [setFocusedExplanation, setFocusedExplanationError, setFocusedExplanationLoading]);

  useEffect(() => {
    if (!focusedLines || !selectedFilePath || !apiKey) {
      return;
    }

    const code = fileContents[selectedFilePath];
    if (!code) return;

    const { start, end } = focusedLines;
    const cacheKey = `${selectedFilePath}:${start}-${end}:${activeLevel}`;

    // Check cache
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setFocusedExplanation(cached);
      setFocusedExplanationLoading(false);
      setFocusedExplanationError("");
      return;
    }

    // Start API call
    abortRef.current = false;
    setFocusedExplanationLoading(true);
    setFocusedExplanationError("");
    setFocusedExplanation(null);

    fetchFocusExplanationStream(
      selectedFilePath,
      code,
      start,
      end,
      activeLevel,
      apiKey,
      {
        onText: (text) => {
          if (!abortRef.current) {
            setFocusedExplanation(text);
          }
        },
        onError: (error) => {
          if (!abortRef.current) {
            setFocusedExplanationError(error);
            setFocusedExplanationLoading(false);
          }
        },
        onDone: (fullText) => {
          if (!abortRef.current) {
            setFocusedExplanation(fullText);
            setFocusedExplanationLoading(false);
            cacheRef.current.set(cacheKey, fullText);
          }
        },
      }
    );

    return () => {
      abortRef.current = true;
    };
  }, [
    focusedLines,
    activeLevel,
    selectedFilePath,
    fileContents,
    apiKey,
    setFocusedExplanation,
    setFocusedExplanationLoading,
    setFocusedExplanationError,
  ]);

  return { retry };
}
