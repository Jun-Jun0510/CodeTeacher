const extensionMap: Record<string, string> = {
  py: "python",
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  json: "json",
  md: "markdown",
  html: "html",
  css: "css",
  scss: "scss",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  c: "c",
  h: "c",
  cpp: "cpp",
  rs: "rust",
  go: "go",
  java: "java",
  rb: "ruby",
  txt: "text",
};

export function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return extensionMap[ext] ?? "text";
}
