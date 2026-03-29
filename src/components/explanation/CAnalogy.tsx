"use client";

import { useState } from "react";
import { Cpu } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { CAnalogy as CAnalogyType } from "@/types/explanation";

interface CAnalogyProps {
  analogy: CAnalogyType;
}

export default function CAnalogy({ analogy }: CAnalogyProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border-l-4 border-emerald-500 bg-emerald-500/5 p-3 rounded-r-md">
        <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-medium text-emerald-400 cursor-pointer hover:text-emerald-300 transition-colors">
          <Cpu className="size-4" />
          <span>C言語での対応</span>
          <span className="ml-auto text-xs text-muted-foreground">
            {open ? "閉じる" : "開く"}
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-3 space-y-2 text-sm">
            <div>
              <span className="font-medium text-foreground">
                {analogy.concept}
              </span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span className="text-emerald-400">{analogy.cEquivalent}</span>
            </div>

            {analogy.cCodeSnippet && (
              <SyntaxHighlighter
                language="c"
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.375rem",
                  fontSize: "0.8rem",
                }}
              >
                {analogy.cCodeSnippet}
              </SyntaxHighlighter>
            )}

            {analogy.warning && (
              <p className="text-amber-400 text-xs">
                ⚠ {analogy.warning}
              </p>
            )}

            <p className="text-muted-foreground">{analogy.detail}</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
