"use client";

import { useProjectStore } from "@/store/projectStore";
import { Badge } from "@/components/ui/badge";
import CAnalogy from "@/components/explanation/CAnalogy";
import type { ExplanationSection } from "@/types/explanation";

const difficultyColors: Record<string, string> = {
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
};

interface SectionBlockProps {
  section: ExplanationSection;
}

export default function SectionBlock({ section }: SectionBlockProps) {
  const setHighlightedLines = useProjectStore((s) => s.setHighlightedLines);

  const handleClick = () => {
    const lines: number[] = [];
    for (let i = section.startLine; i <= section.endLine; i++) {
      lines.push(i);
    }
    setHighlightedLines(lines);

    const el = document.getElementById(`line-${section.startLine}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handleClick}
      >
        <span
          className={`size-2 rounded-full ${difficultyColors[section.difficulty]}`}
        />
        <span className="font-medium text-foreground">{section.title}</span>
        <Badge variant="secondary">
          L{section.startLine}
          {section.endLine !== section.startLine &&
            `-${section.endLine}`}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {section.content}
      </p>

      {section.cAnalogies?.map((analogy, i) => (
        <CAnalogy key={i} analogy={analogy} />
      ))}
    </div>
  );
}
