"use client";

import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useProjectStore } from "@/store/projectStore";
import { FileTree } from "@/components/file-tree/FileTree";
import { WelcomeView } from "./WelcomeView";
import CodeViewer from "@/components/code-view/CodeViewer";
import ExplanationPanel from "@/components/explanation/ExplanationPanel";
import GlobalSummary from "@/components/global-summary/GlobalSummary";

function CenterPanel() {
  const viewMode = useProjectStore((s) => s.viewMode);

  if (viewMode === "welcome") return <WelcomeView />;
  if (viewMode === "globalSummary") return <GlobalSummary />;
  return <CodeViewer />;
}

export function MainLayout() {
  const viewMode = useProjectStore((s) => s.viewMode);
  const showSidePanels = viewMode !== "welcome";

  if (!showSidePanels) {
    return <CenterPanel />;
  }

  const showRightPanel = viewMode === "code";

  return (
    <ResizablePanelGroup orientation="horizontal" className="flex-1">
      <ResizablePanel defaultSize={16} minSize={12}>
        <FileTree />
      </ResizablePanel>
      <ResizableHandle />
      {showRightPanel ? (
        <>
          <ResizablePanel defaultSize={50} minSize={30}>
            <CenterPanel />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={34} minSize={20}>
            <ExplanationPanel />
          </ResizablePanel>
        </>
      ) : (
        <ResizablePanel defaultSize={84} minSize={50}>
          <CenterPanel />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  );
}
