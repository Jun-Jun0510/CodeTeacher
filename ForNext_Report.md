# CodeTeacher ブリーフィングレポート

> **最終更新**: 2026-03-29
> **ステータス**: MVP実装完了 → 次回: AI連携・UI改善フェーズ
> **リポジトリ**: https://github.com/Jun-Jun0510/CodeTeacher
> **起動方法**: `cd code-teacher && npm run dev` → http://localhost:3000

---

## 1. プロジェクト概要

**CodeTeacher** は、コード解読支援Webツールです。
ユーザーがローカルのプロジェクトフォルダを開くと、ファイルツリー・コード表示・レベル別解説が3ペインで表示されます。

**ターゲットユーザー**: プログラミング学習者〜中級者（当初はC言語エンジニア向けだったが、汎用的な解説に方針変更済み）

---

## 2. これまでの経緯

### フェーズ1: 設計議論（2026-03-28）
エージェントチーム3名（architect / ux-designer / domain-expert）で設計議論を実施。
各メンバーが設計書を作成し、クロスレビューで合意を形成した。

```
architect（技術設計）
    ↕ クロスレビュー
ux-designer（UI/UX設計）
    ↕ クロスレビュー
domain-expert（C言語マッピング設計）
```

**成果物（設計書）**:
| ファイル | 内容 |
|---------|------|
| `architecture_design.md` | 技術アーキテクチャ、ディレクトリ構成、データフロー、Zustand設計 |
| `docs/ui-ux-design.md` | UI/UX仕様、3ペインレイアウト、コンポーネント構成、カラースキーム |
| `c_language_mapping_design.md` | C言語マッピング体系、全3レベルの対比表（リファレンス用） |

### フェーズ2: 方針変更（2026-03-29）
ユーザーのフィードバックにより、**C言語マッピングに固執しない方針に変更**。

| 変更前 | 変更後 | 理由 |
|--------|--------|------|
| C言語エンジニア専用ツール | 汎用的なコード解読支援ツール | 幅広いユーザーに有用 |
| Lv1:直訳 / Lv2:概念変換 / Lv3:設計思想 | **初級 / 中級 / 上級** | レベルが直感的 |
| C言語比喩を全面に表示 | **オプション折りたたみ** | 簡単な内容にまでC説明は冗長 |

### フェーズ3: MVP実装（2026-03-29）
エージェントチーム2名（layout-dev / panel-dev）で並列実装。ビルド成功・GitHubプッシュ済み。

---

## 3. 現在の実装状況（MVP完了）

### 動作する機能
| 機能 | 状態 | 詳細 |
|------|:----:|------|
| Welcome画面 | ✅ | 「デモで試す」「フォルダを開く」ボタン |
| フォルダ読み込み | ✅ | File System Access API + webkitdirectory フォールバック |
| ファイルツリー | ✅ | 再帰的表示、フォルダ展開/折りたたみ、拡張子別アイコン |
| コードビューア | ✅ | Prism シンタックスハイライト、行番号、ブレッドクラム |
| 解説パネル | ✅ | 初級/中級/上級タブ、全展開トグル |
| C言語比喩ブロック | ✅ | オプション折りたたみ、Cコードスニペット表示 |
| Global Summary | ✅ | ダッシュボード形式（プロジェクト構造、依存関係、概念マッピング） |
| 行ハイライト連動 | ✅ | 解説セクションクリック → コード行ハイライト + スクロール |
| 3ペインリサイズ | ✅ | shadcn ResizablePanelGroup |
| デモモード | ✅ | FastAPI Todoアプリのモックデータ |

### 制約（現在の制限）
| 制約 | 詳細 |
|------|------|
| **解説はモックデータのみ** | FastAPI Todoの4ファイル（main.py, models.py, routes/todos.py, database.py）のみ解説あり。ユーザーが自分のフォルダを開いた場合、コードは表示されるが解説は「データがありません」 |
| ダークモードのみ | ライトモード未実装 |
| デスクトップ専用 | 1024px未満のレスポンシブ未対応 |
| Safari/Firefox制限 | File System Access API 非対応（input webkitdirectory でフォールバック） |

---

## 4. 技術スタック

| カテゴリ | 選定 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 16.x |
| UIライブラリ | Tailwind CSS + shadcn/ui | 4.x |
| アイコン | Lucide React | 最新 |
| コード表示 | react-syntax-highlighter (Prism) | 15.x |
| 状態管理 | Zustand | 5.x |
| 言語 | TypeScript | 5.x |
| テーマ | next-themes（ダークモード固定） | 最新 |

---

## 5. ディレクトリ構成（実装済み）

```
code-teacher/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # ThemeProvider、ダークモード設定
│   │   ├── page.tsx                # メインページ（'use client'）
│   │   └── globals.css             # Tailwind + shadcn テーマ変数
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # ロゴ + 「フォルダを開く」「デモで試す」
│   │   │   ├── MainLayout.tsx      # 3ペイン（viewModeで切替）
│   │   │   ├── StatusBar.tsx       # ファイル情報バー
│   │   │   └── WelcomeView.tsx     # 初期画面
│   │   ├── file-tree/
│   │   │   ├── FileTree.tsx        # ツリー全体 + Global Summaryリンク
│   │   │   ├── FileTreeNode.tsx    # 再帰的フォルダ/ファイルノード
│   │   │   └── fileIcons.ts        # 拡張子→アイコンマッピング
│   │   ├── code-view/
│   │   │   └── CodeViewer.tsx      # Prism シンタックスハイライト + 行ハイライト
│   │   ├── explanation/
│   │   │   ├── ExplanationPanel.tsx # 初級/中級/上級タブ + 全展開
│   │   │   ├── SectionBlock.tsx    # 解説セクション（タイトル+行番号+難易度+本文）
│   │   │   └── CAnalogy.tsx        # C言語比喩（折りたたみオプション）
│   │   ├── global-summary/
│   │   │   └── GlobalSummary.tsx   # ダッシュボード
│   │   └── ui/                     # shadcn/ui コンポーネント群
│   │
│   ├── hooks/
│   │   └── useFileSystem.ts        # File System Access API + フォールバック
│   ├── store/
│   │   └── projectStore.ts         # Zustand（fileTree, selectedFile, activeLevel, viewMode 等）
│   ├── lib/
│   │   ├── languageDetector.ts     # 拡張子→言語名
│   │   └── utils.ts                # shadcn cn() ユーティリティ
│   ├── mock/
│   │   ├── mockProject.ts          # FastAPI Todoのファイルツリー + コンテンツ
│   │   ├── mockExplanations.ts     # 4ファイル × 3レベルの解説データ
│   │   └── mockGlobalSummary.ts    # プロジェクト全体解説
│   └── types/
│       ├── fileTree.ts             # FileNode 型
│       └── explanation.ts          # ExplanationLevel, CAnalogy, FileExplanation, GlobalSummaryData 等
```

---

## 6. 主要な設計決定（確定済み）

| 決定事項 | 内容 | 経緯 |
|---------|------|------|
| **レベル名** | 初級 / 中級 / 上級 | 当初はC言語対比だったが、ユーザーFBで汎用化 |
| **状態管理** | Zustand | Context APIより再レンダリング最適化が3ペインで重要（architect提案） |
| **Global Summary** | ダッシュボード形式 | モーダルよりも情報密度が高い（ux-designer提案） |
| **C言語比喩** | オプション折りたたみ | 全面表示は冗長。ある場合のみ補足表示（ユーザーFB） |
| **ファイル読み込み** | 遅延読み込み | ツリー構造のみ先行構築、コンテンツはクリック時に読み込み（architect提案） |
| **解説パネル** | タブ + 全展開トグル | domain-expert + ux-designer 合意のハイブリッド方式 |

---

## 7. 次に着手すべきタスク（優先度順）

### 最優先: AI連携（解説自動生成）
現状最大のギャップ。ユーザーが自分のフォルダを開いても解説がない。

| タスク | 内容 | 想定工数 |
|--------|------|---------|
| **Claude API 連携** | ファイル選択時にClaude APIを呼び出し、初級/中級/上級の解説を動的生成 | 大 |
| **プロンプト設計** | 各レベルに適した解説を生成するプロンプトテンプレート作成 | 中 |
| **ストリーミング表示** | 解説生成中のローディング/ストリーミング表示 | 中 |
| **APIキー管理** | ユーザーがAPIキーを入力するUI、またはバックエンドProxy | 中 |
| **Global Summary自動生成** | プロジェクト全体を分析して概要を自動生成 | 中 |

### 高優先: UI/UX改善
| タスク | 内容 |
|--------|------|
| **行ホバーツールチップ** | コード行にホバーで簡易説明ポップアップ（データ構造は定義済み） |
| **キーボードショートカット** | Ctrl+1/2/3 でレベル切替、Ctrl+B でサイドバー、Ctrl+G でGlobal Summary |
| **ファイルタブ** | 複数ファイル同時オープン（現在はブレッドクラムのみ） |
| **ライトモード** | next-themes でダーク/ライト切替 |
| **ファイルツリー検索** | インクリメンタルフィルタ |

### 中優先: 品質・拡張
| タスク | 内容 |
|--------|------|
| **用語集パネル** | インラインツールチップ → 独立パネルへ拡張 |
| **エラーハンドリング** | ファイル読み込み失敗、大きすぎるファイルの警告 |
| **パフォーマンス** | PrismLight + dynamic import、大規模ツリーの仮想化 |
| **テスト** | コンポーネントテスト、E2Eテスト |
| **デプロイ** | Vercel デプロイ設定 |

---

## 8. 型定義リファレンス（実装済み）

```typescript
// types/fileTree.ts
interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  content?: string;
  language?: string;
}

// types/explanation.ts
type ExplanationLevel = "beginner" | "intermediate" | "advanced";
type Difficulty = "green" | "amber" | "red";

interface CAnalogy {
  concept: string;
  cEquivalent: string;
  detail: string;
  cCodeSnippet?: string;  // オプション: Cコードスニペット
  warning?: string;        // オプション: 比喩の注意事項
}

interface ExplanationSection {
  id: string;
  title: string;
  startLine: number;
  endLine: number;
  content: string;
  difficulty: Difficulty;
  cAnalogies?: CAnalogy[];  // オプション: C言語比喩
}

interface FileExplanation {
  filePath: string;
  explanations: {
    beginner: LevelExplanation;
    intermediate: LevelExplanation;
    advanced: LevelExplanation;
  };
}

interface GlobalSummaryData {
  projectName: string;
  overview: string;
  language: string;
  fileCount: number;
  totalLines: number;
  structure: { path: string; role: string }[];
  dependencies: { name: string; description: string }[];
  concepts: { source: string; target: string; description: string }[];
}
```

---

## 9. Zustand ストア（実装済み）

```typescript
// store/projectStore.ts
type ViewMode = "welcome" | "code" | "globalSummary";

interface ProjectState {
  fileTree: FileNode[];
  selectedFilePath: string | null;
  fileContents: Record<string, string>;
  activeLevel: ExplanationLevel;      // "beginner" | "intermediate" | "advanced"
  expandAllLevels: boolean;
  viewMode: ViewMode;
  highlightedLines: number[];
  // + setter関数群 + reset()
}
```

---

## 10. Git履歴

```
a8ff98c feat: CodeTeacher MVP実装
81c87d3 feat: initial commit
06cfde6 Initial commit from Create Next App
```

---

## 11. 関連ドキュメント一覧

| ファイル | 場所 | 用途 |
|---------|------|------|
| `ForNext_Report.md` | プロジェクトルート | **本ファイル**（ブリーフィング資料） |
| `SESSION_SUMMARY.md` | プロジェクトルート | 設計セッションの詳細まとめ（設計フェーズの議論経緯） |
| `project_brief.txt` | プロジェクトルート | 元の要件書 |
| `architecture_design.md` | プロジェクトルート | 技術アーキテクチャ設計書（クロスレビュー統合済み） |
| `docs/ui-ux-design.md` | docs/ | UI/UX設計書 |
| `c_language_mapping_design.md` | プロジェクトルート | C言語マッピング体系（リファレンス用） |
