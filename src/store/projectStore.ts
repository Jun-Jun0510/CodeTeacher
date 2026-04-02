import { create } from "zustand";
import type { FileNode } from "@/types/fileTree";
import type {
  ExplanationLevel,
  FileExplanation,
  GlobalSummaryData,
} from "@/types/explanation";

export type ViewMode = "welcome" | "code" | "globalSummary";

interface ProjectState {
  fileTree: FileNode[];
  setFileTree: (tree: FileNode[]) => void;

  selectedFilePath: string | null;
  selectFile: (path: string) => void;

  fileContents: Record<string, string>;
  setFileContent: (path: string, content: string) => void;

  activeLevel: ExplanationLevel;
  setActiveLevel: (level: ExplanationLevel) => void;

  expandAllLevels: boolean;
  toggleExpandAllLevels: () => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  highlightedLines: number[];
  setHighlightedLines: (lines: number[]) => void;

  // AI integration state
  apiKey: string;
  setApiKey: (key: string) => void;

  explanationCache: Record<string, FileExplanation["explanations"]>;
  setExplanationCache: (
    path: string,
    data: FileExplanation["explanations"]
  ) => void;

  explanationLoading: Record<string, boolean>;
  setExplanationLoading: (path: string, loading: boolean) => void;

  explanationError: Record<string, string>;
  setExplanationError: (path: string, error: string) => void;

  streamingText: Record<string, string>;
  setStreamingText: (path: string, text: string) => void;

  globalSummary: GlobalSummaryData | null;
  setGlobalSummary: (data: GlobalSummaryData | null) => void;

  globalSummaryLoading: boolean;
  setGlobalSummaryLoading: (loading: boolean) => void;

  globalSummaryError: string;
  setGlobalSummaryError: (error: string) => void;

  reset: () => void;
}

const getStoredApiKey = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("codeteacher-api-key") ?? "";
};

const initialState = {
  fileTree: [],
  selectedFilePath: null,
  fileContents: {},
  activeLevel: "beginner" as ExplanationLevel,
  expandAllLevels: false,
  viewMode: "welcome" as ViewMode,
  highlightedLines: [],
  explanationCache: {},
  explanationLoading: {},
  explanationError: {},
  streamingText: {},
  globalSummary: null,
  globalSummaryLoading: false,
  globalSummaryError: "",
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,
  apiKey: getStoredApiKey(),

  setFileTree: (tree) => set({ fileTree: tree }),

  selectFile: (path) =>
    set({ selectedFilePath: path, viewMode: "code", highlightedLines: [] }),

  setFileContent: (path, content) =>
    set((state) => ({
      fileContents: { ...state.fileContents, [path]: content },
    })),

  setActiveLevel: (level) => set({ activeLevel: level }),

  toggleExpandAllLevels: () =>
    set((state) => ({ expandAllLevels: !state.expandAllLevels })),

  setViewMode: (mode) => set({ viewMode: mode }),

  setHighlightedLines: (lines) => set({ highlightedLines: lines }),

  // AI integration setters
  setApiKey: (key) => {
    if (typeof window !== "undefined") {
      if (key) {
        localStorage.setItem("codeteacher-api-key", key);
      } else {
        localStorage.removeItem("codeteacher-api-key");
      }
    }
    set({ apiKey: key });
  },

  setExplanationCache: (path, data) =>
    set((state) => ({
      explanationCache: { ...state.explanationCache, [path]: data },
    })),

  setExplanationLoading: (path, loading) =>
    set((state) => ({
      explanationLoading: { ...state.explanationLoading, [path]: loading },
    })),

  setExplanationError: (path, error) =>
    set((state) => ({
      explanationError: { ...state.explanationError, [path]: error },
    })),

  setStreamingText: (path, text) =>
    set((state) => ({
      streamingText: { ...state.streamingText, [path]: text },
    })),

  setGlobalSummary: (data) => set({ globalSummary: data }),
  setGlobalSummaryLoading: (loading) => set({ globalSummaryLoading: loading }),
  setGlobalSummaryError: (error) => set({ globalSummaryError: error }),

  reset: () => set(initialState),
}));
