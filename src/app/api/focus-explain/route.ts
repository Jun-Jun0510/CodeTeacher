import Anthropic from "@anthropic-ai/sdk";
import { buildFocusExplanationPrompt } from "@/lib/prompts";

export async function POST(request: Request) {
  try {
    const { filePath, code, startLine, endLine, level, apiKey } =
      await request.json();

    if (!apiKey) {
      return Response.json(
        { error: "APIキーが設定されていません" },
        { status: 401 }
      );
    }

    if (!filePath || !code || !startLine || !endLine || !level) {
      return Response.json(
        { error: "必要なパラメータが不足しています" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });
    const prompt = buildFocusExplanationPrompt(
      filePath,
      code,
      startLine,
      endLine,
      level
    );

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const message =
            err instanceof Anthropic.APIError
              ? err.status === 401
                ? "APIキーが無効です"
                : err.status === 429
                  ? "レート制限に達しました。しばらく待ってから再試行してください"
                  : `API エラー: ${err.message}`
              : "予期しないエラーが発生しました";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return Response.json(
      { error: "リクエストの処理に失敗しました" },
      { status: 500 }
    );
  }
}
