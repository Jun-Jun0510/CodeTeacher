"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useProjectStore } from "@/store/projectStore";
import { useFileSystem } from "@/hooks/useFileSystem";
import { getFileIcon } from "./fileIcons";
import { cn } from "@/lib/utils";
import type { FileNode } from "@/types/fileTree";

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
}

export function FileTreeNode({ node, depth }: FileTreeNodeProps) {
  const [open, setOpen] = useState(false);
  const { selectedFilePath, selectFile } = useProjectStore();
  const { loadFileContent } = useFileSystem();

  if (node.type === "directory") {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center gap-1 rounded-sm px-1 py-0.5 text-sm hover:bg-accent",
          )}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {open ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <Folder className="size-4 shrink-0 text-blue-400" />
          <span className="truncate">{node.name}</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {node.children?.map((child) => (
            <FileTreeNode key={child.path} node={child} depth={depth + 1} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  const { icon: Icon, color } = getFileIcon(node.name);
  const isSelected = selectedFilePath === node.path;

  const handleClick = () => {
    selectFile(node.path);
    loadFileContent(node.path);
  };

  return (
    <button
      className={cn(
        "flex w-full items-center gap-1 rounded-sm px-1 py-0.5 text-sm hover:bg-accent",
        isSelected && "bg-accent"
      )}
      style={{ paddingLeft: `${depth * 16 + 20}px` }}
      onClick={handleClick}
    >
      <Icon className={cn("size-4 shrink-0", color)} />
      <span className="truncate">{node.name}</span>
    </button>
  );
}
