import type { GlobalSummaryData } from "@/types/explanation";

export const mockGlobalSummary: GlobalSummaryData = {
  projectName: "FastAPI Todo App",
  overview:
    "PythonのFastAPIフレームワークで構築されたシンプルなTodo管理APIサーバーです。SQLiteデータベースを使い、Todoの一覧取得・作成・削除ができるREST APIを提供します。",
  language: "Python",
  fileCount: 6,
  totalLines: 42,
  structure: [
    {
      path: "main.py",
      role: "エントリーポイント — アプリの起動とルーター登録",
    },
    {
      path: "models.py",
      role: "データ型定義 — Todoアイテムの構造を定義",
    },
    {
      path: "database.py",
      role: "データベース接続管理 — SQLiteへの接続とセッション管理",
    },
    {
      path: "routes/todos.py",
      role: "APIエンドポイント — Todo操作の処理ロジック",
    },
    {
      path: "routes/__init__.py",
      role: "パッケージ宣言 — routesフォルダをモジュールとして認識させる",
    },
    {
      path: "requirements.txt",
      role: "依存パッケージ一覧 — プロジェクトに必要なライブラリ",
    },
  ],
  dependencies: [
    {
      name: "fastapi",
      description: "Webフレームワーク。URLルーティングとリクエスト処理を担当",
    },
    {
      name: "uvicorn",
      description:
        "ASGIサーバー。FastAPIアプリを動かすためのHTTPサーバー",
    },
    {
      name: "sqlalchemy",
      description:
        "ORM（データベース操作ライブラリ）。SQLを書かずにDBを操作可能",
    },
    {
      name: "pydantic",
      description:
        "データバリデーション。受信データの型チェックと変換を自動化",
    },
  ],
  concepts: [
    {
      source: "class",
      target: "データの型定義",
      description: "データがどんな項目を持つかを定義する設計図",
    },
    {
      source: "import",
      target: "ライブラリ読み込み",
      description: "外部の部品やファイルを読み込んで使えるようにする",
    },
    {
      source: "async/await",
      target: "非同期処理",
      description: "待ち時間の間に他の処理を進める効率化の仕組み",
    },
    {
      source: "decorator (@)",
      target: "関数の登録・修飾",
      description: "関数に追加の機能を付ける仕組み（URLとの紐付け等）",
    },
    {
      source: "Depends()",
      target: "依存性注入",
      description: "関数が必要とする部品を自動で準備して渡す仕組み",
    },
  ],
};
