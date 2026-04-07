import type { ReferenceCategory, ReferenceEntry } from "@/types/reference";
import { pythonReference } from "./pythonReference";
import { cReference } from "./cReference";

export const referenceMap: Record<string, ReferenceEntry[]> = {
  python: pythonReference,
  c: cReference,
};

export const supportedLanguages = Object.keys(referenceMap);

export const categoryOrder: ReferenceCategory[] = [
  "control",
  "definition",
  "import",
  "type",
  "function",
  "operator",
  "preprocessor",
];

export const categoryLabels: Record<ReferenceCategory, string> = {
  control: "制御構文",
  definition: "定義・宣言",
  import: "インポート",
  type: "型",
  function: "組み込み関数",
  operator: "演算子",
  preprocessor: "プリプロセッサ",
};
