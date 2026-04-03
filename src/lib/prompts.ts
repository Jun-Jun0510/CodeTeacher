export function buildExplanationPrompt(filePath: string, code: string): string {
  return `あなたはプログラミング教育の専門家です。以下のソースコードについて、初級・中級・上級の3つのレベルで解説を生成してください。

## 対象ファイル
パス: ${filePath}

## ソースコード
\`\`\`
${code}
\`\`\`

## 出力形式
以下のJSON形式で出力してください。JSONのみを出力し、他のテキストは含めないでください。

\`\`\`json
{
  "beginner": {
    "summary": "初心者向けの概要（1-2文）",
    "sections": [
      {
        "id": "一意のID（例: section-1）",
        "title": "セクションタイトル",
        "startLine": 開始行番号,
        "endLine": 終了行番号,
        "content": "初心者向けの詳しい解説。専門用語は避け、日常的な例えを使って説明する。",
        "difficulty": "green",
        "cAnalogies": [
          {
            "concept": "説明する概念",
            "cEquivalent": "C言語での対応概念",
            "detail": "C言語との比較説明",
            "cCodeSnippet": "// C言語のコード例（省略可）",
            "warning": "注意点（省略可）"
          }
        ]
      }
    ]
  },
  "intermediate": {
    "summary": "中級者向けの概要（1-2文）",
    "sections": [
      {
        "id": "一意のID",
        "title": "セクションタイトル",
        "startLine": 開始行番号,
        "endLine": 終了行番号,
        "content": "中級者向けの解説。フレームワークやデザインパターンの知識を含む。",
        "difficulty": "amber",
        "cAnalogies": []
      }
    ]
  },
  "advanced": {
    "summary": "上級者向けの概要（1-2文）",
    "sections": [
      {
        "id": "一意のID",
        "title": "セクションタイトル",
        "startLine": 開始行番号,
        "endLine": 終了行番号,
        "content": "上級者向けの解説。内部実装、パフォーマンス、設計思想を含む。",
        "difficulty": "red",
        "cAnalogies": []
      }
    ]
  }
}
\`\`\`

## ルール
- 全て日本語で記述
- difficultyは初級="green"、中級="amber"、上級="red"
- startLine/endLineはソースコードの実際の行番号に対応させる
- 各レベルで2-5個のセクションを作成
- cAnalogiesはC言語との対比が有用な場合のみ含める（特に初級・上級）
- contentにはMarkdown記法（バッククォート、改行）を使用可能
- idは各セクションで一意にする（例: beginner-1, intermediate-1, advanced-1）
`;
}

export function buildFocusExplanationPrompt(
  filePath: string,
  code: string,
  startLine: number,
  endLine: number,
  level: "beginner" | "intermediate" | "advanced"
): string {
  const levelLabel =
    level === "beginner" ? "初級（初心者向け）" :
    level === "intermediate" ? "中級（実務者向け）" :
    "上級（エキスパート向け）";

  const levelInstruction =
    level === "beginner"
      ? "専門用語は避け、日常的な例えを使って分かりやすく説明してください。C言語との対比が有用であれば含めてください。"
      : level === "intermediate"
        ? "フレームワークやデザインパターンの知識を含めて説明してください。"
        : "内部実装、パフォーマンス、設計思想を含めた詳細な説明をしてください。";

  return `あなたはプログラミング教育の専門家です。以下のソースコードの特定の行範囲について、**短く要点を絞った**解説を生成してください。

## 対象ファイル
パス: ${filePath}

## ソースコード全体
\`\`\`
${code}
\`\`\`

## フォーカス対象
行 ${startLine} 〜 行 ${endLine} に注目してください。
ただし、前後の関連する行も含めて一塊として説明して構いません。

## 解説レベル
${levelLabel}
${levelInstruction}

## 出力形式
- Markdown形式で出力（JSONではない）
- **3〜6文程度の短い解説**にまとめること。冗長な説明は不要
- 箇条書きを活用し、1項目1行で簡潔に書く
- コード例は本当に必要な場合のみ最小限で
- 全て日本語で記述
`;
}

export function buildFlowchartPrompt(filePath: string, code: string): string {
  return `あなたはプログラミング教育の専門家です。以下のソースコードの処理フローをMermaidフローチャートで表現してください。

## 対象ファイル
パス: ${filePath}

## ソースコード
\`\`\`
${code}
\`\`\`

## 出力形式
- Mermaid記法の \`flowchart TD\` を使用
- Mermaidコードブロックのみ出力し、説明テキストは含めない
- 主要な処理フローのみ簡潔に含める（細かい実装詳細は省略）
- ノードラベルは日本語で記述
- 条件分岐がある場合はひし形ノードを使用

## 例
\`\`\`mermaid
flowchart TD
    A[開始] --> B[データ取得]
    B --> C{データあり?}
    C -->|Yes| D[処理実行]
    C -->|No| E[エラー表示]
    D --> F[結果返却]
\`\`\`
`;
}

export function buildGlobalSummaryPrompt(
  fileStructure: string,
  sampleContents: string
): string {
  return `あなたはプログラミング教育の専門家です。以下のプロジェクト情報から、プロジェクト全体の概要を生成してください。

## ファイル構造
${fileStructure}

## 主要ファイルの内容（抜粋）
${sampleContents}

## 出力形式
以下のJSON形式で出力してください。JSONのみを出力し、他のテキストは含めないでください。

\`\`\`json
{
  "projectName": "プロジェクト名",
  "overview": "プロジェクト全体の概要説明（2-3文）",
  "language": "主要なプログラミング言語",
  "fileCount": ファイル数,
  "totalLines": 合計行数（推定）,
  "structure": [
    { "path": "ファイルパス", "role": "そのファイルの役割の簡潔な説明" }
  ],
  "dependencies": [
    { "name": "ライブラリ名", "description": "そのライブラリの役割" }
  ],
  "concepts": [
    { "source": "ソースコード上の要素", "target": "概念名", "description": "概念の説明" }
  ]
}
\`\`\`

## ルール
- 全て日本語で記述
- structureには主要なファイル（最大10件）を含める
- dependenciesにはpackage.json/requirements.txt等から読み取れる依存を含める
- conceptsにはプロジェクトで使われている主要な概念を5-8個含める
- 初学者にもわかりやすい説明を心がける
`;
}
