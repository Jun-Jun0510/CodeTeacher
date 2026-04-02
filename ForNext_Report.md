# CodeTeacher ブリーフィングレポート

> **最終更新**: 2026-04-02
> **ステータス**: AI連携実装完了 → 次回: 実API動作検証・UI/UX改善フェーズ
> **リポジトリ**: https://github.com/Jun-Jun0510/CodeTeacher
> **起動方法**: `cd code-teacher && npm run dev` → http://localhost:3000

---

## 1. プロジェクト概要

**CodeTeacher** は、コード解読支援Webツールです。
ユーザーがローカルのプロジェクトフォルダを開くと、ファイルツリー・コード表示・レベル別解説が3ペインで表示されます。
Claude API連携により、任意のファイルに対して初級/中級/上級の解説をAI自動生成できます。

**ターゲットユーザー**: プログラミング学習者〜中級者（当初はC言語エンジニア向けだったが、汎用的な解説に方針変更済み）

---

## 2. これまでの経緯

### フェーズ1: 設計議論（2026-03-28）
エージェントチーム3名（architect / ux-designer / domain-expert）で設計議論を実施。

**成果物（設計書）**:
| ファイル | 内容 |
|---------|------|
| `architecture_design.md` | 技術アーキテクチャ、ディレクトリ構成、データフロー、Zustand設計 |
| `docs/ui-ux-design.md` | UI/UX仕様、3ペインレイアウト、コンポーネント構成、カラースキーム |
| `c_language_mapping_design.md` | C言語マッピング体系、全3レベルの対比表（リファレンス用） |

### フェーズ2: 方針変更（2026-03-29）
C言語マッピングに固執しない方針に変更。レベル名を「初級/中級/上級」に統一。C言語比喩はオプション折りたたみに。

### フェーズ3: MVP実装（2026-03-29）
エージェントチーム2名（layout-dev / panel-dev）で並列実装。ビルド成功・GitHubプッシュ済み。

### フェーズ4: AI連携実装（2026-04-02）★今回
Claude API（claude-sonnet-4-20250514）を使った解説自動生成機能を実装。SSEストリーミング対応。

---

## 3. 現在の実装状況

### 動作する機能
| 機能 | 状態 | 詳細 |
|------|:----:|------|
| Welcome画面 | ✅ | レスポンシブ対応済み（狭い画面でも崩れない） |
| フォルダ読み込み | ✅ | File System Access API + webkitdirectory フォールバック |
| ファイルツリー | ✅ | 再帰的表示、フォルダ展開/折りたたみ、拡張子別アイコン |
| コードビューア | ✅ | Prism シンタックスハイライト、行番号、ブレッドクラム |
| 解説パネル | ✅ | 初級/中級/上級タブ、全展開トグル、**AI自動生成対応** |
| C言語比喩ブロック | ✅ | オプション折りたたみ、Cコードスニペット表示 |
| Global Summary | ✅ | ダッシュボード形式、**AI自動生成対応** |
| 行ハイライト連動 | ✅ | 解説セクションクリック → コード行ハイライト + スクロール |
| 3ペインリサイズ | ✅ | shadcn ResizablePanelGroup |
| デモモード | ✅ | FastAPI Todoアプリのモックデータ（APIキー不要） |
| **設定ダイアログ** | ✅ | ヘッダーの歯車アイコン → APIキー入力・保存・クリア |
| **AI解説生成** | ✅ | ファイル選択時に自動トリガー、SSEストリーミング表示 |
| **解説キャッシュ** | ✅ | 同一ファイル再選択時はAPI再呼び出しなし |
| **エラーハンドリング** | ✅ | APIキー未設定 → 設定誘導、エラー → 再試行ボタン |

### 未検証（次回要確認）
| 項目 | 詳細 |
|------|------|
| **実APIでのAI生成動作** | APIキーを入力しての実際のAI解説生成はまだ未テスト。SSE解析・JSON解析のE2E確認が必要 |
| **プロンプト品質** | 生成される解説の品質・JSON構造の安定性の検証 |
| **Global Summary自動生成** | 非デモプロジェクトでのGlobal Summary生成の動作確認 |

### 制約（現在の制限）
| 制約 | 詳細 |
|------|------|
| ダークモードのみ | ライトモード未実装 |
| デスクトップ推奨 | Welcome画面はレスポンシブ対応済みだが、3ペイン表示は狭い画面で窮屈 |
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
| AI API | @anthropic-ai/sdk | 最新 |
| AIモデル | claude-sonnet-4-20250514 | - |
| 言語 | TypeScript | 5.x |
| テーマ | next-themes（ダークモード固定） | 最新 |

---

## 5. ディレクトリ構成

```
code-teacher/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # ThemeProvider、ダークモード設定
│   │   ├── page.tsx                # メインページ（'use client'）
│   │   ├── globals.css             # Tailwind + shadcn テーマ変数
│   │   └── api/
│   │       ├── explain/
│   │       │   └── route.ts        # ★ POST: ファイル解説生成（SSEストリーミング）
│   │       └── global-summary/
│   │           └── route.ts        # ★ POST: Global Summary生成（SSEストリーミング）
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # ロゴ + 「フォルダを開く」「デモで試す」+ ★設定ボタン
│   │   │   ├── MainLayout.tsx      # 3ペイン（welcomeモードではパネルなし）
│   │   │   ├── StatusBar.tsx       # ファイル情報バー
│   │   │   └── WelcomeView.tsx     # 初期画面（★レスポンシブ対応済み）
│   │   ├── file-tree/
│   │   │   ├── FileTree.tsx        # ツリー全体 + Global Summaryリンク
│   │   │   ├── FileTreeNode.tsx    # 再帰的フォルダ/ファイルノード
│   │   │   └── fileIcons.ts        # 拡張子→アイコンマッピング
│   │   ├── code-view/
│   │   │   └── CodeViewer.tsx      # Prism シンタックスハイライト + 行ハイライト
│   │   ├── explanation/
│   │   │   ├── ExplanationPanel.tsx # ★AI連携: キャッシュ→モック→API自動生成
│   │   │   ├── SectionBlock.tsx    # 解説セクション
│   │   │   ├── CAnalogy.tsx        # C言語比喩（折りたたみオプション）
│   │   │   └── StreamingIndicator.tsx # ★AI生成中のスピナー+プレビュー
│   │   ├── settings/
│   │   │   └── SettingsDialog.tsx   # ★APIキー入力ダイアログ（独自実装）
│   │   ├── global-summary/
│   │   │   └── GlobalSummary.tsx   # ★AI連携: store → モックフォールバック
│   │   └── ui/                     # shadcn/ui コンポーネント群
│   │
│   ├── hooks/
│   │   ├── useFileSystem.ts        # File System Access API + フォールバック
│   │   ├── useExplanation.ts       # ★キャッシュ確認→モック→API呼び出し
│   │   └── useGlobalSummary.ts     # ★Global Summary生成フック
│   ├── store/
│   │   └── projectStore.ts         # ★拡張済み: apiKey, explanationCache, loading/error/streaming, globalSummary
│   ├── lib/
│   │   ├── languageDetector.ts     # 拡張子→言語名
│   │   ├── utils.ts                # shadcn cn() ユーティリティ
│   │   ├── prompts.ts              # ★プロンプトテンプレート（日本語解説生成指示）
│   │   └── apiClient.ts            # ★SSEストリーム消費、JSON解析
│   ├── mock/
│   │   ├── mockProject.ts          # FastAPI Todoのファイルツリー + コンテンツ
│   │   ├── mockExplanations.ts     # 4ファイル × 3レベルの解説データ
│   │   └── mockGlobalSummary.ts    # プロジェクト全体解説
│   └── types/
│       ├── fileTree.ts             # FileNode 型
│       └── explanation.ts          # ExplanationLevel, CAnalogy, FileExplanation, GlobalSummaryData 等
```

★ = 今回（フェーズ4）で新規追加/変更したファイル

---

## 6. AI連携アーキテクチャ（フェーズ4で実装）

### データフロー
```
ファイル選択 → ExplanationPanel useEffect
  → キャッシュあり → 即表示
  → モックマッチ → モックデータ使用（デモモード互換）
  → APIキーなし → 設定誘導表示
  → APIキーあり → POST /api/explain（SSEストリーミング）
    → streamingText更新 → StreamingIndicator表示
    → 完了 → JSON解析 → explanationCache格納 → 解説表示
```

### APIルート設計
- `POST /api/explain` — `{ filePath, code, apiKey }` → SSEストリーム
- `POST /api/global-summary` — `{ fileStructure, sampleContents, apiKey }` → SSEストリーム
- Anthropic SDK の `messages.stream()` 使用
- エラー: 401（APIキー無効）/ 429（レート制限）/ ネットワークエラー

### 重要な技術的判断
| 判断 | 理由 |
|------|------|
| **base-ui Dialog 不使用** | `@base-ui/react/dialog` が Next.js 16 のルーターと衝突（`Router action dispatched before initialization`エラー）。SettingsDialog は独自実装のオーバーレイで代替 |
| **Welcome時はパネル非表示** | `MainLayout` で welcomeモード時に FileTree/ResizablePanel を非表示化。狭い画面でテキストが1文字ずつ改行される問題を解消 |
| **APIキーはlocalStorage** | ブラウザに保存、サーバーには送らない。`reset()` でもクリアしない設計 |

---

## 7. 主要な設計決定（確定済み）

| 決定事項 | 内容 | 経緯 |
|---------|------|------|
| **レベル名** | 初級 / 中級 / 上級 | 当初はC言語対比だったが、ユーザーFBで汎用化 |
| **状態管理** | Zustand | Context APIより再レンダリング最適化が3ペインで重要 |
| **Global Summary** | ダッシュボード形式 | モーダルよりも情報密度が高い |
| **C言語比喩** | オプション折りたたみ | 全面表示は冗長。ある場合のみ補足表示 |
| **ファイル読み込み** | 遅延読み込み | ツリー構造のみ先行構築、コンテンツはクリック時 |
| **AIモデル** | claude-sonnet-4-20250514 | コスト・速度・品質のバランス |
| **ストリーミング** | SSE（Server-Sent Events） | WebSocketより実装がシンプルでHTTP互換 |

---

## 8. Zustand ストア（拡張済み）

```typescript
interface ProjectState {
  // MVP部分
  fileTree: FileNode[];
  selectedFilePath: string | null;
  fileContents: Record<string, string>;
  activeLevel: ExplanationLevel;
  expandAllLevels: boolean;
  viewMode: ViewMode;
  highlightedLines: number[];

  // ★ AI連携（フェーズ4追加）
  apiKey: string;                                        // localStorage連携
  explanationCache: Record<string, FileExplanation["explanations"]>;
  explanationLoading: Record<string, boolean>;
  explanationError: Record<string, string>;
  streamingText: Record<string, string>;
  globalSummary: GlobalSummaryData | null;
  globalSummaryLoading: boolean;
  globalSummaryError: string;
  // + 各フィールドのsetter + reset()
}
```

---

## 9. 次に着手すべきタスク（優先度順）

### 最優先: AI動作検証
| タスク | 内容 |
|--------|------|
| **実APIキーでの動作テスト** | APIキーを入力し、実際にファイル解説が生成されるかE2E確認 |
| **プロンプト品質チューニング** | 生成されるJSONの構造安定性、解説の質・粒度を検証・調整 |
| **Global Summary実動作確認** | 非デモプロジェクトでの自動生成を検証 |

### 高優先: UI/UX改善
| タスク | 内容 |
|--------|------|
| **行ホバーツールチップ** | コード行にホバーで簡易説明ポップアップ |
| **キーボードショートカット** | Ctrl+1/2/3 でレベル切替、Ctrl+B でサイドバー |
| **ファイルタブ** | 複数ファイル同時オープン |
| **ライトモード** | next-themes でダーク/ライト切替 |
| **ファイルツリー検索** | インクリメンタルフィルタ |

### 中優先: 品質・拡張
| タスク | 内容 |
|--------|------|
| **用語集パネル** | インラインツールチップ → 独立パネル |
| **エラーハンドリング強化** | ファイル読み込み失敗、大きすぎるファイル警告 |
| **パフォーマンス** | PrismLight + dynamic import、大規模ツリー仮想化 |
| **テスト** | コンポーネントテスト、E2Eテスト |
| **デプロイ** | Vercel デプロイ設定 |

---

## 10. 関連ドキュメント一覧

| ファイル | 場所 | 用途 |
|---------|------|------|
| `ForNext_Report.md` | プロジェクトルート | **本ファイル**（ブリーフィング資料） |
| `SESSION_SUMMARY.md` | プロジェクトルート | 設計セッションの詳細まとめ |
| `project_brief.txt` | プロジェクトルート | 元の要件書 |
| `architecture_design.md` | プロジェクトルート | 技術アーキテクチャ設計書 |
| `docs/ui-ux-design.md` | docs/ | UI/UX設計書 |
| `c_language_mapping_design.md` | プロジェクトルート | C言語マッピング体系（リファレンス用） |
