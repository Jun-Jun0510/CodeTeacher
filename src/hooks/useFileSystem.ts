"use client";

import { useCallback } from "react";
import type { FileNode } from "@/types/fileTree";
import { detectLanguage } from "@/lib/languageDetector";
import { useProjectStore } from "@/store/projectStore";

const EXCLUDED_DIRS = new Set([
  "node_modules",
  ".git",
  "__pycache__",
  ".venv",
  ".next",
  ".cache",
  "dist",
  ".DS_Store",
]);

async function readDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  parentPath: string
): Promise<FileNode[]> {
  const entries: FileNode[] = [];

  // Use values() iterator for TS compatibility
  for await (const entry of (dirHandle as unknown as AsyncIterable<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>)) {
    const [name, handle] = entry;
    if (EXCLUDED_DIRS.has(name)) continue;

    const path = parentPath ? `${parentPath}/${name}` : name;

    if (handle.kind === "directory") {
      const children = await readDirectoryHandle(
        handle as FileSystemDirectoryHandle,
        path
      );
      entries.push({ name, path, type: "directory", children });
    } else {
      entries.push({
        name,
        path,
        type: "file",
        language: detectLanguage(name),
      });
    }
  }

  // Sort: directories first, then alphabetically
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return entries;
}

async function readFileContent(
  dirHandle: FileSystemDirectoryHandle,
  filePath: string
): Promise<string> {
  const parts = filePath.split("/");
  let currentHandle: FileSystemDirectoryHandle = dirHandle;

  for (let i = 0; i < parts.length - 1; i++) {
    currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
  }

  const fileHandle = await currentHandle.getFileHandle(parts[parts.length - 1]);
  const file = await fileHandle.getFile();
  return file.text();
}

function buildTreeFromFileList(files: File[]): {
  tree: FileNode[];
  contents: Record<string, string>;
} {
  const root: FileNode[] = [];
  const contents: Record<string, string> = {};
  const dirMap = new Map<string, FileNode>();

  for (const file of files) {
    const relativePath = file.webkitRelativePath;
    const parts = relativePath.split("/");

    // Skip excluded directories
    if (parts.some((p) => EXCLUDED_DIRS.has(p))) continue;

    // Remove the root folder prefix from webkitRelativePath
    const pathParts = parts.slice(1);
    if (pathParts.length === 0) continue;

    const filePath = pathParts.join("/");

    // Ensure parent directories exist
    for (let i = 0; i < pathParts.length - 1; i++) {
      const dirPath = pathParts.slice(0, i + 1).join("/");
      if (!dirMap.has(dirPath)) {
        const dirNode: FileNode = {
          name: pathParts[i],
          path: dirPath,
          type: "directory",
          children: [],
        };
        dirMap.set(dirPath, dirNode);

        if (i === 0) {
          root.push(dirNode);
        } else {
          const parentPath = pathParts.slice(0, i).join("/");
          const parent = dirMap.get(parentPath);
          parent?.children?.push(dirNode);
        }
      }
    }

    // Add file node (content will be loaded lazily)
    const fileNode: FileNode = {
      name: pathParts[pathParts.length - 1],
      path: filePath,
      type: "file",
      language: detectLanguage(pathParts[pathParts.length - 1]),
    };

    if (pathParts.length === 1) {
      root.push(fileNode);
    } else {
      const parentPath = pathParts.slice(0, -1).join("/");
      const parent = dirMap.get(parentPath);
      parent?.children?.push(fileNode);
    }
  }

  // Sort recursively
  const sortNodes = (nodes: FileNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  };
  sortNodes(root);

  return { tree: root, contents };
}

export function useFileSystem() {
  const { setFileTree, setFileContent, setViewMode } = useProjectStore();

  const openFolder = useCallback(async () => {
    // Try File System Access API first
    if ("showDirectoryPicker" in window) {
      try {
        const dirHandle = await (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
        const tree = await readDirectoryHandle(dirHandle, "");
        setFileTree(tree);
        setViewMode("code");

        // Store dirHandle for lazy file reading
        (window as unknown as Record<string, unknown>).__dirHandle = dirHandle;
        return;
      } catch (err) {
        // User cancelled or API not available
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: input type="file" with webkitdirectory
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.multiple = true;

    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) return;

      const { tree } = buildTreeFromFileList(files);
      setFileTree(tree);
      setViewMode("code");

      // Store files for lazy content reading
      const fileMap = new Map<string, File>();
      for (const file of files) {
        const parts = file.webkitRelativePath.split("/").slice(1);
        if (!parts.some((p) => EXCLUDED_DIRS.has(p))) {
          fileMap.set(parts.join("/"), file);
        }
      }
      (window as unknown as Record<string, unknown>).__fileMap = fileMap;
    };

    input.click();
  }, [setFileTree, setViewMode]);

  const loadFileContent = useCallback(
    async (filePath: string) => {
      const store = useProjectStore.getState();
      if (store.fileContents[filePath]) return;

      try {
        // Try File System Access API handle
        const dirHandle = (window as unknown as Record<string, unknown>).__dirHandle as FileSystemDirectoryHandle | undefined;
        if (dirHandle) {
          const content = await readFileContent(dirHandle, filePath);
          setFileContent(filePath, content);
          return;
        }

        // Try fallback file map
        const fileMap = (window as unknown as Record<string, unknown>).__fileMap as Map<string, File> | undefined;
        if (fileMap) {
          const file = fileMap.get(filePath);
          if (file) {
            const content = await file.text();
            setFileContent(filePath, content);
          }
        }
      } catch {
        // File could not be read
      }
    },
    [setFileContent]
  );

  return { openFolder, loadFileContent };
}
