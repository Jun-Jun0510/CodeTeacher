import type { ReferenceEntry, DetectedConstruct } from "@/types/reference";
import { referenceMap } from "@/data/reference";

function isCommentLine(line: string, language: string): boolean {
  const trimmed = line.trimStart();
  if (language === "python") {
    return trimmed.startsWith("#");
  }
  if (language === "c") {
    return trimmed.startsWith("//");
  }
  return false;
}

function buildPattern(entry: ReferenceEntry): RegExp {
  const kw = entry.keyword;

  if (entry.category === "preprocessor") {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^\\s*${escaped}\\b`);
  }

  if (entry.category === "operator") {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped);
  }

  if (entry.category === "function") {
    return new RegExp(`\\b${kw}\\s*\\(`);
  }

  return new RegExp(`\\b${kw}\\b`);
}

export function detectConstructs(
  code: string,
  language: string
): DetectedConstruct[] {
  const entries = referenceMap[language];
  if (!entries) return [];

  const lines = code.split("\n");
  const patterns = entries.map((entry) => ({
    entry,
    regex: buildPattern(entry),
  }));

  const resultMap = new Map<
    string,
    { entry: ReferenceEntry; lines: number[] }
  >();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isCommentLine(line, language)) continue;

    for (const { entry, regex } of patterns) {
      if (regex.test(line)) {
        const existing = resultMap.get(entry.keyword);
        if (existing) {
          existing.lines.push(i + 1);
        } else {
          resultMap.set(entry.keyword, { entry, lines: [i + 1] });
        }
      }
    }
  }

  return Array.from(resultMap.values()).map(({ entry, lines }) => ({
    entry,
    lines,
    firstLine: lines[0],
  }));
}
