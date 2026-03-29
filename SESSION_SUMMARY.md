# CodeTeacher セッションまとめ

> **作成日**: 2026-03-28
> **フェーズ**: 設計完了 → 次回: 実装開始

---

## 1. プロジェクト概要

**CodeTeacher** — C言語エンジニア向けのコード解読支援Webツール。
AIが生成した複雑なPython/Web系プロジェクトを、C言語の概念（ポインタ、構造体、メモリ管理等）に置き換えて理解するための学習支援ツール。

### 元の要件（project_brief.txt）
- フォルダ一括読み込み（File System Access API）
- プロジェクト全体解説（Global Summary）
- レベル別ファイル解説ビュー（3段階）
- C言語翻訳UI
- MVP: モックデータで動作確認

---

## 2. チーム編成と議論フロー

### チーム構成（エージェントチーム）
| メンバー | 役割 | 担当タスク |
|---------|------|-----------|
| **architect** | 技術アーキテクト | プロジェクト構造、File System Access API、データフロー、状態管理 |
| **ux-designer** | UI/UXデザイナー | 3ペインレイアウト、コンポーネント構成、カラースキーム |
| **domain-expert** | C言語ドメインエキスパート | レベル別解説体系、C言語マッピング、モックデータ解説コンテンツ |

### 議論フロー
```
1. 3名が並行して各自の設計書を作成
2. 各メンバーが他の2名にフィードバックを送信（クロスレビュー）
3. domain-expert ⇔ ux-designer: 解説パネル表示方法、レベル名変更で合意
4. domain-expert ⇔ architect: モックデータJSON構造、型定義拡張で合意
5. architect ⇔ ux-designer: 状態管理（Zustand）、MVPスコープで合意
6. 全員の合意事項を各設計書に反映
```

---

## 3. 設計書一覧（成果物）

| ファイル | 内容 |
|---------|------|
| `architecture_design.md` | 技術アーキテクチャ（ディレクトリ構成、API、データフロー、Zustand設計、クロスレビュー統合） |
| `docs/ui-ux-design.md` | UI/UX仕様（レイアウト、コンポーネント、カラースキーム、インタラクション） |
| `c_language_mapping_design.md` | C言語マッピング体系（全3レベルの対比表、解説例、モックデータ、型定義） |
| `project_brief.txt` | 元の要件書（変更なし） |

---

## 4. 全チーム合意事項（最終版）

### 要件からの変更点
| 項目 | 元の要件 | 変更後 | 理由 |
|------|---------|--------|------|
| レベル名 | ロジック/構文特有/アーキテクチャ | **直訳/概念変換/設計思想** | 目的がより明確になる |
| サンプルプロジェクト | Flask | **FastAPI Todo** | 型ヒント・async・依存性注入の教育的価値 |
| C言語翻訳UI | 独立機能 | **解説パネル内に統合**（CAnalogyコンポーネント） | コンテキスト維持しながら学習できる |
| Global Summary | モーダル/オーバーレイ | **中央+右ペイン結合ダッシュボード** | 情報密度が高いUI要件に合致 |

### 技術的な合意
| 項目 | 決定 |
|------|------|
| 状態管理 | **Zustand**（セレクタによる再レンダリング最適化） |
| テーマ | **ダークモードデフォルト**（MVPではダークのみ） |
| レスポンシブ | **1024px以上のみ**（デスクトップ前提） |
| ファイルタブ | MVPでは**ブレッドクラム**で代替 |
| 解説パネル | **タブ切替 + 全展開トグル**のハイブリッド |
| 難易度表示 | **セクションレベル**の粒度（green/amber/red） |
| 行ハイライト | ホバーは**Ref+DOM直接操作**、クリックのみZustand |
| 用語集 | MVPでは**インラインツールチップ** |
| viewMode | `'welcome' | 'code' | 'globalSummary'` の3画面管理 |

### CAnalogy型（合意版）
```typescript
interface CAnalogy {
  concept: string;        // "デコレータ @app.route"
  cEquivalent: string;    // "関数ポインタのルーティングテーブル"
  detail: string;         // 詳細な解説
  cCodeSnippet?: string;  // 対応するCコード
  warning?: string;       // 比喩の注意事項
}
```

### MVPで実装しないもの
- ファイルタブ（複数ファイル同時オープン）
- 768px未満のレスポンシブ対応
- ファイルツリー検索バー
- ライトモード
- 用語集パネル（独立パネル版）
- `cFullTranslation`（main.pyのLv1を除く）
- 行ホバーツールチップ（データ構造は先行定義済み）

---

## 5. 技術スタック

| カテゴリ | 選定 |
|---------|------|
| フレームワーク | Next.js 15.x (App Router) |
| UIライブラリ | Tailwind CSS 4.x + shadcn/ui |
| アイコン | Lucide React |
| コード表示 | react-syntax-highlighter (Prism) |
| 状態管理 | Zustand 5.x |
| 言語 | TypeScript 5.x |
| テーマ管理 | next-themes |

---

## 6. ディレクトリ構成（合意版）

```
code-teacher/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ThemeProvider, フォント設定
│   │   ├── page.tsx            # メインページ ('use client')
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # ロゴ + フォルダ選択 + テーマ切替
│   │   │   ├── MainLayout.tsx  # ResizablePanelGroup 3ペイン
│   │   │   └── StatusBar.tsx   # ファイル情報表示
│   │   ├── file-tree/
│   │   │   ├── FileTree.tsx    # ツリー全体 + Global Summaryリンク
│   │   │   ├── FileTreeNode.tsx # 再帰的ノード
│   │   │   └── fileIcons.ts    # 拡張子→アイコン
│   │   ├── code-view/
│   │   │   └── CodeViewer.tsx  # react-syntax-highlighter ラッパー
│   │   ├── explanation/
│   │   │   ├── ExplanationPanel.tsx # レベルタブ + 解説
│   │   │   ├── LevelTabs.tsx
│   │   │   ├── ExplanationContent.tsx
│   │   │   ├── CAnalogy.tsx    # C言語比喩ボックス
│   │   │   └── SectionBlock.tsx
│   │   └── global-summary/
│   │       └── GlobalSummary.tsx # ダッシュボード
│   ├── hooks/
│   │   └── useFileSystem.ts    # File System Access API + フォールバック
│   ├── store/
│   │   └── projectStore.ts     # Zustand ストア
│   ├── lib/
│   │   ├── fileReader.ts
│   │   └── languageDetector.ts
│   ├── mock/
│   │   ├── mockProject.ts     # FastAPI Todoのファイルツリー + コンテンツ
│   │   ├── mockExplanations.ts # 全3レベルの解説データ
│   │   └── mockGlobalSummary.ts
│   └── types/
│       ├── fileTree.ts
│       └── explanation.ts      # CAnalogy, FileExplanation, GlobalSummary 等
```

---

## 7. 次回やること（実装フェーズ）

### 実装の推奨順序
1. **プロジェクト初期化**: Next.js + Tailwind + shadcn/ui + Zustand セットアップ
2. **型定義**: `types/` 配下の全型を定義
3. **モックデータ**: `mock/` 配下のFastAPI Todoデータ作成
4. **Zustandストア**: `store/projectStore.ts`
5. **レイアウト骨格**: Header + 3ペイン（ResizablePanelGroup）+ StatusBar
6. **ファイルツリー**: FileTree + FileTreeNode（再帰的表示）
7. **コードビューア**: CodeViewer（react-syntax-highlighter）
8. **解説パネル**: ExplanationPanel + LevelTabs + CAnalogy
9. **Global Summary**: ダッシュボードビュー
10. **File System Access API**: useFileSystem フック
11. **行ハイライト連動**: コード ⇔ 解説の双方向連動
12. **Welcome画面**: デモボタン + フォルダ選択CTA

### 並列実装が可能な単位
- グループA: 型定義 + モックデータ + ストア（基盤）
- グループB: レイアウト + ファイルツリー（左ペイン）
- グループC: コードビューア + 解説パネル（中央+右ペイン）
- グループD: Global Summary（独立ビュー）

---

## 8. 重要な設計判断メモ

- **File System Access API**: Chrome/Edgeのみ対応。Safari/Firefoxは `<input webkitdirectory>` でフォールバック
- **遅延読み込み**: ツリー構造は即座に構築、ファイル内容はクリック時に読み込み
- **除外パターン**: `node_modules/`, `.git/`, `__pycache__/`, `.venv/` は自動スキップ
- **react-syntax-highlighter**: `PrismLight` + dynamic import でバンドルサイズ最適化
- **SSR対応**: `'use client'` ディレクティブ + `typeof window` ガードが必須
- **比喩の注意**: 「async = スレッド」は絶対避ける（CAnalogy.warningで警告表示）

---

## 9. 設計方針の変更（2026-03-29 ユーザーフィードバック）

### 変更の要旨
**C言語マッピングに固執しない方針に変更。** わかりやすい解説であれば言語比較にこだわらなくてよい。

### 理由
- 簡単な概念までC言語で説明すると冗長・煩わしい
- ユーザーの知識レベルに応じた粒度の方が実用的

### レベル体系の再定義

| 変更前（チーム合意版） | 変更後 | 内容 |
|----------------------|--------|------|
| Lv1: 直訳（C言語対比） | **初級** | 型定義、変数、関数の基本説明。プログラミング初学者でもわかるレベル |
| Lv2: 概念変換（C言語概念で説明） | **中級** | 言語固有の構文（リスト内包表記、デコレータ、async等）。他言語経験者向け |
| Lv3: 設計思想（アーキテクチャ） | **上級** | フレームワークの設計思想、アーキテクチャパターン、メモリ挙動 |

### C言語比喩の扱い
- **廃止ではなくオプション化**: 上級者向けの補足情報として残す
- CAnalogyコンポーネントは残すが、解説の主軸ではなく「参考」程度の位置づけ
- 全レベルにC言語比喩を強制しない

### 実装への影響
- `CAnalogy.tsx` → 必須表示ではなく、データがある場合のみ表示する折りたたみブロックに
- モックデータの解説文: C言語前提の文体 → **汎用的でわかりやすい解説**に書き直し
- レベルタブのラベル: 直訳/概念変換/設計思想 → **初級/中級/上級**
- 型定義 `CAnalogy` は残すが optional 扱いを強化
- `c_language_mapping_design.md` の対比表はリファレンスとして残し、モックデータでは必要な箇所のみ使用
