import { create } from "zustand";
import type { FileNode } from "@/types/fileTree";
import type {
  ActiveTab,
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

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  activeLevel: ExplanationLevel;
  setActiveLevel: (level: ExplanationLevel) => void;

  expandAllLevels: boolean;
  toggleExpandAllLevels: () => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  highlightedLines: number[];
  setHighlightedLines: (lines: number[]) => void;

  // Focus explanation state
  focusedLines: { start: number; end: number } | null;
  setFocusedLines: (lines: { start: number; end: number } | null) => void;

  focusedExplanation: string | null;
  setFocusedExplanation: (text: string | null) => void;

  focusedExplanationLoading: boolean;
  setFocusedExplanationLoading: (loading: boolean) => void;

  focusedExplanationError: string;
  setFocusedExplanationError: (error: string) => void;

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
  activeTab: "explanation" as ActiveTab,
  activeLevel: "beginner" as ExplanationLevel,
  expandAllLevels: false,
  viewMode: "welcome" as ViewMode,
  highlightedLines: [],
  focusedLines: null as { start: number; end: number } | null,
  focusedExplanation: null as string | null,
  focusedExplanationLoading: false,
  focusedExplanationError: "",
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
    set({
      selectedFilePath: path,
      viewMode: "code",
      highlightedLines: [],
      focusedLines: null,
      focusedExplanation: null,
      focusedExplanationLoading: false,
      focusedExplanationError: "",
    }),

  setFileContent: (path, content) =>
    set((state) => ({
      fileContents: { ...state.fileContents, [path]: content },
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setActiveLevel: (level) => set({ activeLevel: level }),

  toggleExpandAllLevels: () =>
    set((state) => ({ expandAllLevels: !state.expandAllLevels })),

  setViewMode: (mode) => set({ viewMode: mode }),

  setHighlightedLines: (lines) => set({ highlightedLines: lines }),

  // Focus explanation setters
  setFocusedLines: (lines) => set({ focusedLines: lines }),
  setFocusedExplanation: (text) => set({ focusedExplanation: text }),
  setFocusedExplanationLoading: (loading) =>
    set({ focusedExplanationLoading: loading }),
  setFocusedExplanationError: (error) =>
    set({ focusedExplanationError: error }),

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
