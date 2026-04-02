import type { FileExplanation } from "@/types/explanation";
import type { GlobalSummaryData } from "@/types/explanation";

interface StreamCallbacks {
  onText: (text: string) => void;
  onError: (error: string) => void;
  onDone: (fullText: string) => void;
}

async function consumeSSEStream(
  response: Response,
  callbacks: StreamCallbacks
) {
  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError("レスポンスの読み取りに失敗しました");
    return;
  }

  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);

        if (data === "[DONE]") {
          callbacks.onDone(fullText);
          return;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            callbacks.onError(parsed.error);
            return;
          }
          if (parsed.text) {
            fullText += parsed.text;
            callbacks.onText(fullText);
          }
        } catch {
          // ignore malformed JSON chunks
        }
      }
    }
    callbacks.onDone(fullText);
  } catch {
    callbacks.onError("ストリーミングが中断されました");
  }
}

export async function fetchExplanationStream(
  filePath: string,
  code: string,
  apiKey: string,
  callbacks: StreamCallbacks
) {
  try {
    const response = await fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath, code, apiKey }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      callbacks.onError(err?.error ?? `HTTPエラー: ${response.status}`);
      return;
    }

    await consumeSSEStream(response, callbacks);
  } catch {
    callbacks.onError("ネットワークエラーが発生しました");
  }
}

export async function fetchGlobalSummaryStream(
  fileStructure: string,
  sampleContents: string,
  apiKey: string,
  callbacks: StreamCallbacks
) {
  try {
    const response = await fetch("/api/global-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileStructure, sampleContents, apiKey }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      callbacks.onError(err?.error ?? `HTTPエラー: ${response.status}`);
      return;
    }

    await consumeSSEStream(response, callbacks);
  } catch {
    callbacks.onError("ネットワークエラーが発生しました");
  }
}

export function parseExplanationJSON(
  text: string
): FileExplanation["explanations"] | null {
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (parsed.beginner && parsed.intermediate && parsed.advanced) {
      return parsed as FileExplanation["explanations"];
    }
    return null;
  } catch {
    return null;
  }
}

export function parseGlobalSummaryJSON(text: string): GlobalSummaryData | null {
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();
    const parsed = JSON.parse(jsonStr);

    if (parsed.projectName && parsed.overview) {
      return parsed as GlobalSummaryData;
    }
    return null;
  } catch {
    return null;
  }
}
