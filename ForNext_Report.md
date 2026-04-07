# CodeTeacher ブリーフィングレポート

> **最終更新**: 2026-04-08
> **ステータス**: 言語リファレンスタブ実装完了 → 次回: 実API動作検証・UI/UX改善フェーズ
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

### フェーズ4: AI連携実装（2026-04-02）
Claude API（claude-sonnet-4-20250514）を使った解説自動生成機能を実装。SSEストリーミング対応。
フォーカス解説機能（コード行クリック → 選択範囲のピンポイント解説）も実装。

### フェーズ5: フローチャート機能実装（2026-04-03）
AIがコードの処理フローをMermaidフローチャートとして生成し、モーダルで視覚的に表示する機能を追加。

### フェーズ6: 言語リファレンスタブ実装（2026-04-08）★今回
Python/C言語の基本構文を**静的リファレンス**として事前定義し、解説パネルの4番目のタブ「参照」として表示する機能を追加。コードに出現する構文を自動検出し、行番号リンクで対応箇所をハイライト・スクロール可能。API呼び出しゼロで従量課金を削減。

---

## 3. 今回（フェーズ6）で実装した内容

### 言語リファレンスタブ機能

**目的**: AI生成の解説（初級/中級/上級）はコードの「内容」を説明するが、言語の「構文・使い方」は毎回AIが生成していた。Python/C言語の基本構文を静的リファレンスとして事前に用意し、APIコストゼロで構文参照できるようにした。

**新規ファイル一覧**:
| ファイル | 内容 |
|---------|------|
| `src/types/reference.ts` | 型定義（`ReferenceCategory`, `ReferenceEntry`, `DetectedConstruct`） |
| `src/data/reference/pythonReference.ts` | Python構文リファレンス（39エントリ: 制御構文/定義/インポート/型/関数/演算子） |
| `src/data/reference/cReference.ts` | C言語構文リファレンス（30エントリ: 制御構文/定義/プリプロセッサ/型/関数/演算子） |
| `src/data/reference/index.ts` | バレルエクスポート + 言語→リファレンスマップ + カテゴリ表示順・ラベル |
| `src/lib/constructDetector.ts` | 構文検出ユーティリティ（正規表現マッチ、コメント行スキップ） |
| `src/components/explanation/ReferencePanel.tsx` | リファレンスタブUI（カテゴリ別Collapsible、行ハイライト連動） |

**変更ファイル一覧**:
| ファイル | 内容 |
|---------|------|
| `src/types/explanation.ts` | `ActiveTab` 型追加（`"explanation" \| "reference"`） |
| `src/store/projectStore.ts` | `activeTab` / `setActiveTab` 状態追加 |
| `src/components/explanation/ExplanationPanel.tsx` | タブバーに「参照」追加 + early returnリファクタ（タブバーが常に表示されるように） |

**構文検出ロジック** (`constructDetector.ts`):
- コードを行ごとに走査
- キーワードの種類に応じた正規表現パターン:
  - 通常キーワード: `\bkeyword\b`（単語境界）
  - 関数: `\bkeyword\s*\(`（関数呼び出しパターン）
  - プリプロセッサ: `^\s*keyword\b`（行頭）
  - 演算子: リテラルエスケープ
- コメント行はスキップ（Python: `#`, C: `//`）

**ExplanationPanel リファクタのポイント**:
- **変更前**: loading/error/noAPIKey状態でearly return → タブバーが非表示
- **変更後**: タブバーは常に表示。loading/error等は解説タブのコンテンツ内で条件分岐
- リファレンスタブはAPIキー不要で常に動作
- フローチャート・全展開ボタンは解説タブ時のみ表示

**技術的判断**:
| 判断 | 理由 |
|------|------|
| 静的リファレンスデータ | API呼び出しゼロ。従量課金削減。レスポンス即時 |
| `useMemo` で検出結果キャッシュ | code/languageが変わらない限り再計算しない |
| カテゴリ別Collapsible | 大量のエントリを整理。SectionBlockと同じUIパターン |
| `ActiveTab` をストアで管理 | 解説レベル（`activeLevel`）と独立して管理。タブ切替時の状態保持 |

---

## 4. 現在の実装状況

### 動作する機能
| 機能 | 状態 | 詳細 |
|------|:----:|------|
| Welcome画面 | ✅ | レスポンシブ対応済み（狭い画面でも崩れない） |
| フォルダ読み込み | ✅ | File System Access API + webkitdirectory フォールバック |
| ファイルツリー | ✅ | 再帰的表示、フォルダ展開/折りたたみ、拡張子別アイコン |
| コードビューア | ✅ | Prism シンタックスハイライト、行番号、ブレッドクラム |
| 解説パネル | ✅ | 初級/中級/上級タブ、全展開トグル、AI自動生成対応 |
| **言語リファレンス** | ✅ | ★今回追加。「参照」タブ → Python/C構文を自動検出・カテゴリ別表示・行ハイライト連動 |
| C言語比喩ブロック | ✅ | オプション折りたたみ、Cコードスニペット表示 |
| Global Summary | ✅ | ダッシュボード形式、AI自動生成対応 |
| 行ハイライト連動 | ✅ | 解説セクションクリック → コード行ハイライト + スクロール |
| フォーカス解説 | ✅ | コード行クリック → 選択範囲のピンポイントAI解説 |
| フローチャート | ✅ | GitBranchボタン → Mermaidフローチャートモーダル表示 |
| 3ペインリサイズ | ✅ | shadcn ResizablePanelGroup |
| デモモード | ✅ | FastAPI Todoアプリのモックデータ（APIキー不要） |
| 設定ダイアログ | ✅ | ヘッダーの歯車アイコン → APIキー入力・保存・クリア |
| AI解説生成 | ✅ | ファイル選択時に自動トリガー、SSEストリーミング表示 |
| 解説キャッシュ | ✅ | 同一ファイル再選択時はAPI再呼び出しなし |
| エラーハンドリング | ✅ | APIキー未設定 → 設定誘導、エラー → 再試行ボタン |

### 未検証（次回要確認）
| 項目 | 詳細 |
|------|------|
| **実APIでのAI生成動作** | APIキーを入力しての実際のAI解説生成はまだ未テスト。SSE解析・JSON解析のE2E確認が必要 |
| **プロンプト品質** | 生成される解説の品質・JSON構造の安定性の検証 |
| **Global Summary自動生成** | 非デモプロジェクトでのGlobal Summary生成の動作確認 |
| **フローチャート生成品質** | Mermaid記法の安定性、フローチャートの見やすさの検証 |
| **リファレンス検出精度** | ★今回追加。構文検出の誤検出・検出漏れの確認（特にコメント内・文字列内のキーワード） |

### 制約（現在の制限）
| 制約 | 詳細 |
|------|------|
| ダークモードのみ | ライトモード未実装 |
| デスクトップ推奨 | Welcome画面はレスポンシブ対応済みだが、3ペイン表示は狭い画面で窮屈 |
| Safari/Firefox制限 | File System Access API 非対応（input webkitdirectory でフォールバック） |
| リファレンス対応言語 | Python / C のみ（他言語は「未対応」メッセージ表示） |

---

## 5. 技術スタック

| カテゴリ | 選定 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 16.x |
| UIライブラリ | Tailwind CSS + shadcn/ui | 4.x |
| アイコン | Lucide React | 最新 |
| コード表示 | react-syntax-highlighter (Prism) | 15.x |
| 状態管理 | Zustand | 5.x |
| AI API | @anthropic-ai/sdk | 最新 |
| AIモデル | claude-sonnet-4-20250514 | - |
| フローチャート | mermaid | 11.x |
| 言語 | TypeScript | 5.x |
| テーマ | next-themes（ダークモード固定） | 最新 |

---

## 6. ディレクトリ構成

```
code-teacher/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # ThemeProvider、ダークモード設定
│   │   ├── page.tsx                # メインページ（'use client'）
│   │   ├── globals.css             # Tailwind + shadcn テーマ変数
│   │   └── api/
│   │       ├── explain/
│   │       │   └── route.ts        # POST: ファイル解説生成（SSEストリーミング）
│   │       ├── focus-explain/
│   │       │   └── route.ts        # POST: フォーカス解説生成（SSEストリーミング）
│   │       ├── flowchart/
│   │       │   └── route.ts        # POST: フローチャート生成（SSEストリーミング）
│   │       └── global-summary/
│   │           └── route.ts        # POST: Global Summary生成（SSEストリーミング）
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # ロゴ + 「フォルダを開く」「デモで試す」+ 設定ボタン
│   │   │   ├── MainLayout.tsx      # 3ペイン（welcomeモードではパネルなし）
│   │   │   ├── StatusBar.tsx       # ファイル情報バー
│   │   │   └── WelcomeView.tsx     # 初期画面（レスポンシブ対応済み）
│   │   ├── file-tree/
│   │   │   ├── FileTree.tsx        # ツリー全体 + Global Summaryリンク
│   │   │   ├── FileTreeNode.tsx    # 再帰的フォルダ/ファイルノード
│   │   │   └── fileIcons.ts        # 拡張子→アイコンマッピング
│   │   ├── code-view/
│   │   │   └── CodeViewer.tsx      # Prism シンタックスハイライト + 行ハイライト
│   │   ├── explanation/
│   │   │   ├── ExplanationPanel.tsx # 解説パネル本体（初級/中級/上級 + ★参照タブ）
│   │   │   ├── SectionBlock.tsx    # 解説セクション
│   │   │   ├── CAnalogy.tsx        # C言語比喩（折りたたみオプション）
│   │   │   ├── StreamingIndicator.tsx # AI生成中のスピナー+プレビュー
│   │   │   ├── FlowchartDialog.tsx # Mermaidフローチャートモーダル
│   │   │   └── ReferencePanel.tsx  # ★ 言語リファレンスタブUI
│   │   ├── settings/
│   │   │   └── SettingsDialog.tsx   # APIキー入力ダイアログ（独自実装）
│   │   ├── global-summary/
│   │   │   └── GlobalSummary.tsx   # AI連携: store → モックフォールバック
│   │   └── ui/                     # shadcn/ui コンポーネント群
│   │
│   ├── data/                       # ★ 静的データ（今回新規）
│   │   └── reference/
│   │       ├── pythonReference.ts  # ★ Python構文リファレンス（39エントリ）
│   │       ├── cReference.ts       # ★ C言語構文リファレンス（30エントリ）
│   │       └── index.ts            # ★ バレルエクスポート + カテゴリ定義
│   │
│   ├── hooks/
│   │   ├── useFileSystem.ts        # File System Access API + フォールバック
│   │   ├── useExplanation.ts       # キャッシュ確認→モック→API呼び出し
│   │   ├── useFocusExplanation.ts  # フォーカス解説生成フック
│   │   └── useGlobalSummary.ts     # Global Summary生成フック
│   ├── store/
│   │   └── projectStore.ts         # Zustand: apiKey, activeTab, explanationCache, loading/error/streaming等
│   ├── lib/
│   │   ├── languageDetector.ts     # 拡張子→言語名
│   │   ├── utils.ts                # shadcn cn() ユーティリティ
│   │   ├── prompts.ts              # プロンプトテンプレート（解説 / フォーカス / フローチャート / Global Summary）
│   │   ├── apiClient.ts            # SSEストリーム消費、JSON解析、fetchFlowchartStream / parseMermaidCode
│   │   └── constructDetector.ts    # ★ 構文検出ユーティリティ
│   ├── mock/
│   │   ├── mockProject.ts          # FastAPI Todoのファイルツリー + コンテンツ
│   │   ├── mockExplanations.ts     # 4ファイル × 3レベルの解説データ
│   │   └── mockGlobalSummary.ts    # プロジェクト全体解説
│   └── types/
│       ├── fileTree.ts             # FileNode 型
│       ├── explanation.ts          # ExplanationLevel, ActiveTab, CAnalogy, FileExplanation, GlobalSummaryData 等
│       └── reference.ts            # ★ ReferenceCategory, ReferenceEntry, DetectedConstruct
```

★ = 今回（フェーズ6）で新規追加/変更したファイル

---

## 7. AI連携アーキテクチャ

### APIルート設計
| エンドポイント | メソッド | パラメータ | 用途 |
|--------------|---------|-----------|------|
| `/api/explain` | POST | `{ filePath, code, apiKey }` | ファイル解説（3レベル）生成 |
| `/api/focus-explain` | POST | `{ filePath, code, startLine, endLine, level, apiKey }` | フォーカス解説生成 |
| `/api/flowchart` | POST | `{ filePath, code, apiKey }` | フローチャート生成 |
| `/api/global-summary` | POST | `{ fileStructure, sampleContents, apiKey }` | Global Summary生成 |

すべてSSEストリーミング。Anthropic SDK の `messages.stream()` 使用。

### 重要な技術的判断
| 判断 | 理由 |
|------|------|
| **base-ui Dialog 不使用（SettingsDialog）** | `@base-ui/react/dialog` が Next.js 16 のルーターと衝突。独自実装のオーバーレイで代替 |
| **FlowchartDialogはbase-ui Dialog使用** | フローチャートモーダルではbase-ui Dialogが正常動作したためそのまま使用 |
| **Welcome時はパネル非表示** | `MainLayout` で welcomeモード時に FileTree/ResizablePanel を非表示化 |
| **APIキーはlocalStorage** | ブラウザに保存、サーバーには送らない。`reset()` でもクリアしない設計 |
| **mermaid は dynamic import** | クライアントサイドのみ必要。バンドルサイズ削減 |
| **フローチャートキャッシュは useRef** | Zustandに入れる必要なし。コンポーネントローカルで十分 |
| **リファレンスは静的データ** | ★API不要。構文データは変わらないため事前定義が最適 |

---

## 8. 主要な設計決定（確定済み）

| 決定事項 | 内容 | 経緯 |
|---------|------|------|
| **レベル名** | 初級 / 中級 / 上級 | 当初はC言語対比だったが、ユーザーFBで汎用化 |
| **状態管理** | Zustand | Context APIより再レンダリング最適化が3ペインで重要 |
| **Global Summary** | ダッシュボード形式 | モーダルよりも情報密度が高い |
| **C言語比喩** | オプション折りたたみ | 全面表示は冗長。ある場合のみ補足表示 |
| **ファイル読み込み** | 遅延読み込み | ツリー構造のみ先行構築、コンテンツはクリック時 |
| **AIモデル** | claude-sonnet-4-20250514 | コスト・速度・品質のバランス |
| **ストリーミング** | SSE（Server-Sent Events） | WebSocketより実装がシンプルでHTTP互換 |
| **フローチャート表示** | Mermaid → SVG → モーダル | ライブラリが成熟、ダークテーマ対応、SVG出力で高品質 |
| **言語リファレンス** | 静的データ + 正規表現検出 | ★API不要で即時表示。コスト削減と応答速度を両立 |
| **タブ管理** | `ActiveTab`（explanation/reference）と`ExplanationLevel`を分離 | ★解説レベルとリファレンスタブは独立した状態 |

---

## 9. 次に着手すべきタスク（優先度順）

### 最優先: AI動作検証
| タスク | 内容 |
|--------|------|
| **実APIキーでの動作テスト** | APIキーを入力し、実際にファイル解説が生成されるかE2E確認 |
| **プロンプト品質チューニング** | 生成されるJSONの構造安定性、解説の質・粒度を検証・調整 |
| **Global Summary実動作確認** | 非デモプロジェクトでの自動生成を検証 |
| **フローチャート生成品質確認** | Mermaid記法の安定性、フローチャートの見やすさを検証 |

### 高優先: リファレンス機能改善
| タスク | 内容 |
|--------|------|
| **検出精度向上** | 文字列リテラル内のキーワード誤検出を防ぐ（現在はコメント行のみスキップ） |
| **対応言語追加** | JavaScript/TypeScript等のリファレンスデータ追加 |
| **リファレンスデータ拡充** | 既存Python/Cのエントリ追加（デコレータ、リスト内包表記、ポインタ等） |

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
| **エラーハンドリング強化** | ファイル読み込み失敗、大きすぎるファイル警告 |
| **パフォーマンス** | PrismLight + dynamic import、大規模ツリー仮想化 |
| **テスト** | コンポーネントテスト、E2Eテスト |
| **デプロイ** | Vercel デプロイ設定 |

---

## 10. 関連ドキュメント一覧

| ファイル | 場所 | 用途 |
|---------|------|------|
| `ForNext_Report.md` | code-teacher/ | **本ファイル**（ブリーフィング資料） |
| `SESSION_SUMMARY.md` | プロジェクトルート | 設計セッションの詳細まとめ |
| `project_brief.txt` | プロジェクトルート | 元の要件書 |
| `architecture_design.md` | プロジェクトルート | 技術アーキテクチャ設計書 |
| `docs/ui-ux-design.md` | docs/ | UI/UX設計書 |
| `c_language_mapping_design.md` | プロジェクトルート | C言語マッピング体系（リファレンス用） |
