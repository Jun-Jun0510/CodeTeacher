import { create } from "zustand";
import type { FileNode } from "@/types/fileTree";
import type { ExplanationLevel } from "@/types/explanation";

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

  reset: () => void;
}

const initialState = {
  fileTree: [],
  selectedFilePath: null,
  fileContents: {},
  activeLevel: "beginner" as ExplanationLevel,
  expandAllLevels: false,
  viewMode: "welcome" as ViewMode,
  highlightedLines: [],
};

export const useProjectStore = create<ProjectState>((set) => ({
  ...initialState,

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

  reset: () => set(initialState),
}));
