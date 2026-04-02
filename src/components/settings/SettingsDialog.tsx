"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Settings, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectStore } from "@/store/projectStore";

export function SettingsDialog() {
  const apiKey = useProjectStore((s) => s.apiKey);
  const setApiKey = useProjectStore((s) => s.setApiKey);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [showKey, setShowKey] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setDraft(apiKey);
    setShowKey(false);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = () => {
    setApiKey(draft.trim());
    setOpen(false);
  };

  const handleClear = () => {
    setDraft("");
    setApiKey("");
  };

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <Settings className="size-4" />
        <span className="hidden sm:inline">設定</span>
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        <Settings className="size-4" />
        <span className="hidden sm:inline">設定</span>
      </Button>

      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === overlayRef.current) handleClose();
        }}
      >
        {/* Dialog */}
        <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>

          {/* Header */}
          <div className="flex flex-col gap-2 mb-4">
            <h2 className="text-base font-medium">設定</h2>
            <p className="text-sm text-muted-foreground">
              Claude
              APIキーを入力すると、任意のファイルに対してAI解説を自動生成できます。
              キーはブラウザのlocalStorageに保存されます。
            </p>
          </div>

          {/* Content */}
          <div className="space-y-3 mb-4">
            <label className="text-sm font-medium text-foreground">
              Anthropic APIキー
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="sk-ant-..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {draft && (
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
            {apiKey && (
              <p className="text-xs text-muted-foreground">
                APIキーが設定済みです
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="-mx-4 -mb-4 flex gap-2 justify-end rounded-b-xl border-t bg-muted/50 p-4">
            <Button variant="outline" onClick={handleClose}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </div>
        </div>
      </div>
    </>
  );
}
