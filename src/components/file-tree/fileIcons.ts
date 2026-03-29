import {
  FileText,
  FileCode,
  FileJson,
  FileType,
  Database,
  Terminal,
  Palette,
  Globe,
  Cog,
  FileImage,
  type LucideIcon,
} from "lucide-react";

interface FileIconInfo {
  icon: LucideIcon;
  color: string;
}

const extensionIconMap: Record<string, FileIconInfo> = {
  // Python
  py: { icon: FileCode, color: "text-yellow-400" },
  // JavaScript / TypeScript
  js: { icon: FileCode, color: "text-yellow-300" },
  jsx: { icon: FileCode, color: "text-cyan-400" },
  ts: { icon: FileCode, color: "text-blue-400" },
  tsx: { icon: FileCode, color: "text-blue-300" },
  // Web
  html: { icon: Globe, color: "text-orange-400" },
  css: { icon: Palette, color: "text-purple-400" },
  scss: { icon: Palette, color: "text-pink-400" },
  // Data
  json: { icon: FileJson, color: "text-yellow-200" },
  yaml: { icon: FileText, color: "text-red-300" },
  yml: { icon: FileText, color: "text-red-300" },
  toml: { icon: FileText, color: "text-gray-300" },
  // Config
  env: { icon: Cog, color: "text-gray-400" },
  gitignore: { icon: Cog, color: "text-gray-400" },
  // Database
  sql: { icon: Database, color: "text-blue-300" },
  db: { icon: Database, color: "text-blue-300" },
  // Shell
  sh: { icon: Terminal, color: "text-green-400" },
  bash: { icon: Terminal, color: "text-green-400" },
  zsh: { icon: Terminal, color: "text-green-400" },
  // Docs
  md: { icon: FileText, color: "text-gray-300" },
  txt: { icon: FileText, color: "text-gray-400" },
  // Images
  png: { icon: FileImage, color: "text-green-300" },
  jpg: { icon: FileImage, color: "text-green-300" },
  svg: { icon: FileImage, color: "text-orange-300" },
  // Systems
  c: { icon: FileCode, color: "text-blue-500" },
  h: { icon: FileCode, color: "text-blue-400" },
  cpp: { icon: FileCode, color: "text-blue-600" },
  rs: { icon: FileCode, color: "text-orange-500" },
  go: { icon: FileCode, color: "text-cyan-300" },
  java: { icon: FileCode, color: "text-red-400" },
  rb: { icon: FileCode, color: "text-red-500" },
  // Font
  ttf: { icon: FileType, color: "text-gray-400" },
  otf: { icon: FileType, color: "text-gray-400" },
};

const defaultIcon: FileIconInfo = { icon: FileText, color: "text-muted-foreground" };

export function getFileIcon(filename: string): FileIconInfo {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return extensionIconMap[ext] ?? defaultIcon;
}
