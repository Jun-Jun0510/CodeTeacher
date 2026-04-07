export type ReferenceCategory =
  | "control"
  | "definition"
  | "import"
  | "type"
  | "function"
  | "operator"
  | "preprocessor";

export interface ReferenceEntry {
  keyword: string;
  category: ReferenceCategory;
  title: string;
  description: string;
  syntax: string;
  example: string;
}

export interface DetectedConstruct {
  entry: ReferenceEntry;
  lines: number[];
  firstLine: number;
}
