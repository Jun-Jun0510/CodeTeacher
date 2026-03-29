export type ExplanationLevel = "beginner" | "intermediate" | "advanced";

export type Difficulty = "green" | "amber" | "red";

export interface CAnalogy {
  concept: string;
  cEquivalent: string;
  detail: string;
  cCodeSnippet?: string;
  warning?: string;
}

export interface ExplanationSection {
  id: string;
  title: string;
  startLine: number;
  endLine: number;
  content: string;
  difficulty: Difficulty;
  cAnalogies?: CAnalogy[];
}

export interface LevelExplanation {
  summary: string;
  sections: ExplanationSection[];
}

export interface FileExplanation {
  filePath: string;
  explanations: {
    beginner: LevelExplanation;
    intermediate: LevelExplanation;
    advanced: LevelExplanation;
  };
}

export interface GlobalSummaryData {
  projectName: string;
  overview: string;
  language: string;
  fileCount: number;
  totalLines: number;
  structure: { path: string; role: string }[];
  dependencies: { name: string; description: string }[];
  concepts: { source: string; target: string; description: string }[];
}
