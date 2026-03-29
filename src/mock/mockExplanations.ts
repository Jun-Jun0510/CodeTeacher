import type { FileExplanation } from "@/types/explanation";

export const mockExplanations: FileExplanation[] = [
  {
    filePath: "todo_app/main.py",
    explanations: {
      beginner: {
        summary:
          "このファイルはアプリケーションの起動ポイントです。Webサーバーを起動し、URLごとの処理を登録します。",
        sections: [
          {
            id: "main-import",
            title: "ライブラリの読み込み",
            startLine: 1,
            endLine: 2,
            content:
              "`from fastapi import FastAPI` は外部ライブラリ（FastAPI）を読み込んでいます。`import` は「このファイルで使いたい部品を持ってくる」命令です。2行目では自分で作った `routes` フォルダから `todos` モジュールを読み込んでいます。",
            difficulty: "green",
          },
          {
            id: "main-app-init",
            title: "アプリケーションの作成",
            startLine: 4,
            endLine: 4,
            content:
              "`app = FastAPI()` でWebアプリケーションの本体を作っています。`FastAPI()` はクラスのインスタンス化と呼ばれ、設計図（クラス）から実体（オブジェクト）を生成する操作です。この `app` が全体の中心となり、URLの登録やリクエストの処理を担当します。",
            difficulty: "green",
          },
          {
            id: "main-router",
            title: "ルーティングの登録",
            startLine: 5,
            endLine: 5,
            content:
              "`app.include_router(todos.router, prefix=\"/todos\")` は「/todos で始まるURLへのアクセスは todos モジュールに任せる」という設定です。URLとプログラムの処理を対応づける仕組みを**ルーティング**と呼びます。",
            difficulty: "green",
          },
          {
            id: "main-entry",
            title: "サーバー起動",
            startLine: 7,
            endLine: 9,
            content:
              "`if __name__ == \"__main__\":` は「このファイルが直接実行されたとき」だけ中のコードを動かす条件です。`uvicorn.run()` でWebサーバーが起動し、ブラウザからのアクセスを待ち受けます。`host=\"0.0.0.0\"` はすべてのネットワークから接続を受け付ける設定、`port=8000` はポート番号8000番を使う意味です。",
            difficulty: "green",
          },
        ],
      },
      intermediate: {
        summary:
          "FastAPIのアプリケーション初期化とルーター登録。ASGIフレームワークの構造と、モジュール分割パターンを理解します。",
        sections: [
          {
            id: "main-fastapi-class",
            title: "FastAPIクラスのインスタンス化",
            startLine: 4,
            endLine: 4,
            content:
              "`FastAPI()` はASGI（Asynchronous Server Gateway Interface）アプリケーションを生成します。内部的にはStarletteフレームワークを継承しており、ルーティングテーブル、ミドルウェアスタック、例外ハンドラなどが初期化されます。Djangoの `django.setup()` やExpressの `express()` に相当します。",
            difficulty: "amber",
          },
          {
            id: "main-include-router",
            title: "ルーターのプレフィックス登録",
            startLine: 5,
            endLine: 5,
            content:
              "`include_router` はルーターオブジェクトを特定のURLプレフィックスにマウントします。これにより `todos.py` 内の `@router.get(\"/\")` は実際には `/todos/` にマッピングされます。大規模アプリではこのパターンで機能ごとにルートを分離します。",
            difficulty: "amber",
          },
          {
            id: "main-name-guard",
            title: "__name__ ガード",
            startLine: 7,
            endLine: 9,
            content:
              "Pythonではすべての `.py` ファイルがモジュールとしてインポート可能です。`__name__` は直接実行時に `\"__main__\"` になり、インポート時はモジュール名になります。このガードにより、他のファイルから `import main` してもサーバーが勝手に起動しません。テストや本番デプロイ時に `uvicorn main:app` コマンドで起動する場合、この `if` ブロックは実行されません。",
            difficulty: "amber",
          },
        ],
      },
      advanced: {
        summary:
          "ASGIアプリケーションのライフサイクル、ミドルウェアパイプライン、uvicornのイベントループ動作を理解します。",
        sections: [
          {
            id: "main-asgi",
            title: "ASGIフレームワークの設計思想",
            startLine: 1,
            endLine: 5,
            content:
              "FastAPIはASGI規格に準拠したフレームワークです。ASGIは「HTTPリクエストを受け取って非同期に処理し、レスポンスを返す」インターフェースを定義しています。\n\nリクエストの処理フロー:\n1. uvicornがソケットでHTTPリクエストを受信\n2. ASGIプロトコルでFastAPIアプリに渡す\n3. ミドルウェアチェーンを順に通過\n4. ルーティングテーブルからハンドラを特定\n5. ハンドラを実行してレスポンスを生成\n6. uvicornがHTTPレスポンスとして送信\n\nこの設計により、1つのプロセスで数千の同時接続を効率的に処理できます。",
            difficulty: "red",
            cAnalogies: [
              {
                concept: "ASGIアプリケーション",
                cEquivalent: "イベント駆動型サーバー（epoll/selectベース）",
                detail:
                  "uvicornの内部はCで書かれたイベントループ（uvloop = libuv）で動作しています。",
                cCodeSnippet:
                  "// イベントループの疑似コード\nwhile (1) {\n    int nfds = epoll_wait(epfd, events, MAX_EVENTS, -1);\n    for (int i = 0; i < nfds; i++) {\n        handle_event(events[i]);\n    }\n}",
              },
            ],
          },
          {
            id: "main-middleware",
            title: "ミドルウェアとルーター設計パターン",
            startLine: 5,
            endLine: 5,
            content:
              "`include_router` は関心の分離（Separation of Concerns）を実現する設計パターンです。各ルーターモジュールは独立してテスト可能で、別のプレフィックスへの付け替えも容易です。\n\nマイクロサービスへの移行時には、ルーターを独立したサービスに切り出すことも可能です。このモジュール性がFastAPIの設計思想の核心です。",
            difficulty: "red",
          },
        ],
      },
    },
  },
  {
    filePath: "todo_app/models.py",
    explanations: {
      beginner: {
        summary:
          "このファイルはデータの形（型）を定義しています。Todoアイテムがどんな情報を持つかを決める設計図です。",
        sections: [
          {
            id: "models-class",
            title: "データの型定義",
            startLine: 4,
            endLine: 8,
            content:
              "`class TodoItem(BaseModel):` は「Todoアイテムはこういうデータを持つ」という設計図です。`id: int` は整数型のID、`title: str` は文字列型のタイトル。型を指定することで、間違った種類のデータが入るのを防ぎます。",
            difficulty: "green",
          },
          {
            id: "models-optional",
            title: "省略可能なフィールド",
            startLine: 7,
            endLine: 8,
            content:
              "`Optional[str] = None` は「この項目は省略してもOK」という意味です。省略された場合は `None`（値なし）になります。`completed: bool = False` は初期値が `False`（未完了）であることを示します。",
            difficulty: "green",
          },
        ],
      },
      intermediate: {
        summary:
          "Pydanticによるデータバリデーションモデル。型ヒントを活用した実行時の型チェック機構を理解します。",
        sections: [
          {
            id: "models-pydantic",
            title: "Pydantic BaseModel",
            startLine: 4,
            endLine: 8,
            content:
              "`BaseModel` を継承することで、Pydanticの強力なバリデーション機能が自動的に有効になります。\n\n- JSONからの自動パース（デシリアライズ）\n- 型チェック（`int`に文字列を渡すとエラー）\n- デフォルト値の自動適用\n- `.model_dump()` でdictへの変換\n\nTypeScriptの `interface` やGoの `struct` に型チェック機能を追加したものと考えられます。",
            difficulty: "amber",
          },
          {
            id: "models-type-hints",
            title: "型ヒントの仕組み",
            startLine: 5,
            endLine: 8,
            content:
              "Pythonの型ヒント（`id: int`）は通常、実行時に強制されません。しかしPydanticは `BaseModel` のサブクラスに対して実行時バリデーションを行います。`Optional[str]` は `Union[str, None]` の省略形で、「文字列またはNone」を意味します。",
            difficulty: "amber",
          },
        ],
      },
      advanced: {
        summary:
          "Pydanticのメタクラス機構、データ変換パイプライン、ORMモデルとの違いを理解します。",
        sections: [
          {
            id: "models-meta",
            title: "Pydanticの内部動作",
            startLine: 4,
            endLine: 8,
            content:
              "Pydanticはメタクラスを使って、クラス定義時にバリデータを自動生成します。各フィールドに対して型チェック関数が作られ、インスタンス生成時に実行されます。\n\nv2ではRust製のコア（pydantic-core）が使われており、バリデーション速度が大幅に向上しています。\n\n注意: PydanticモデルはORMモデル（SQLAlchemy等）とは異なります。Pydanticはデータの検証と変換を担当し、ORMモデルはデータベースとのマッピングを担当します。",
            difficulty: "red",
            cAnalogies: [
              {
                concept: "Pydanticバリデーション",
                cEquivalent: "構造体への型安全なデシリアライズ",
                detail:
                  "JSONバイト列を受け取り、各フィールドの型を検証しながら構造体に変換する処理に相当します。",
                cCodeSnippet:
                  "int parse_todo(const char *json, TodoItem *out) {\n    // 各フィールドを型チェックしながらパース\n    if (!json_is_int(json, \"id\")) return -1;\n    out->id = json_get_int(json, \"id\");\n    // ...\n    return 0;\n}",
              },
            ],
          },
        ],
      },
    },
  },
  {
    filePath: "todo_app/routes/todos.py",
    explanations: {
      beginner: {
        summary:
          "このファイルはTodoに対する操作（一覧取得・作成・削除）を定義しています。URLにアクセスしたときに実行される処理の本体です。",
        sections: [
          {
            id: "todos-router",
            title: "ルーターの作成",
            startLine: 5,
            endLine: 6,
            content:
              "`router = APIRouter()` でURLと処理の対応表を作成します。`todos_db` は仮のデータ保存場所（リスト）です。",
            difficulty: "green",
          },
          {
            id: "todos-get",
            title: "一覧取得（GET /）",
            startLine: 8,
            endLine: 10,
            content:
              "`@router.get(\"/\")` は「GETリクエストが来たらこの関数を実行する」という宣言です。`async def list_todos` がその処理で、データベースから全Todoを取得して返します。ブラウザでURLを開くのがGETリクエストに相当します。",
            difficulty: "green",
          },
          {
            id: "todos-post",
            title: "新規作成（POST /）",
            startLine: 12,
            endLine: 15,
            content:
              "`@router.post(\"/\")` はPOSTリクエスト用です。POSTは「新しいデータを送信する」ときに使います。`todo: TodoItem` の部分で、送信されたJSONデータが自動的にTodoItem型に変換されます。",
            difficulty: "green",
          },
          {
            id: "todos-delete",
            title: "削除（DELETE /{todo_id}）",
            startLine: 17,
            endLine: 22,
            content:
              "`@router.delete(\"/{todo_id}\")` は削除用のURL。`{todo_id}` はURLの一部を変数として受け取る仕組みです（例: `/todos/3` で `todo_id=3`）。該当するTodoが見つからない場合は404エラーを返します。",
            difficulty: "green",
          },
        ],
      },
      intermediate: {
        summary:
          "FastAPIのルーターパターン、依存性注入（Depends）、HTTPメソッドとCRUD操作の対応を理解します。",
        sections: [
          {
            id: "todos-decorator",
            title: "デコレータによるルーティング",
            startLine: 8,
            endLine: 10,
            content:
              "`@router.get(\"/\")` はPythonのデコレータ構文です。これは `list_todos = router.get(\"/\")(list_todos)` と同じ意味で、関数をルーティングテーブルに登録するラッパーです。HTTPメソッド（GET/POST/PUT/DELETE）ごとに異なるデコレータが用意されており、REST APIの設計原則に従っています。",
            difficulty: "amber",
          },
          {
            id: "todos-depends",
            title: "依存性注入（Depends）",
            startLine: 9,
            endLine: 9,
            content:
              "`db=Depends(get_db)` はFastAPIの依存性注入（DI）機構です。関数の実行前に `get_db()` を呼び出し、その戻り値を `db` 引数に自動的に渡します。\n\n利点:\n- DBセッションの取得/解放を一元管理\n- テスト時にモックに差し替え可能\n- 共通処理（認証チェック等）の再利用",
            difficulty: "amber",
            cAnalogies: [
              {
                concept: "依存性注入（Depends）",
                cEquivalent: "関数呼び出し前の前処理パターン",
                detail:
                  "手動でDB接続を取得して渡す代わりに、フレームワークが自動で行う仕組みです。",
                cCodeSnippet:
                  "// Cでの手動DI相当\nvoid list_todos(request_t *req, response_t *res) {\n    db_t *db = get_db();  // 手動で取得\n    // ... 処理 ...\n    release_db(db);       // 手動で解放\n}",
              },
            ],
          },
          {
            id: "todos-exception",
            title: "HTTPException",
            startLine: 20,
            endLine: 20,
            content:
              "`raise HTTPException(status_code=404)` は例外を投げてリクエスト処理を中断します。FastAPIがこの例外をキャッチし、適切なHTTPレスポンス（404 Not Found）に変換します。通常のreturnとは異なり、処理フローを即座に中断できます。",
            difficulty: "amber",
          },
        ],
      },
      advanced: {
        summary:
          "非同期ハンドラの実行モデル、ORMクエリの遅延評価、REST設計原則の詳細を理解します。",
        sections: [
          {
            id: "todos-async",
            title: "async/awaitと非同期処理",
            startLine: 9,
            endLine: 10,
            content:
              "`async def` で定義された関数はコルーチンです。内部で `await` を使ってI/O待ち（DB問い合わせ、ファイル読み書き等）の間、他のリクエストを処理できます。\n\nこの例では `db.query()` が同期的なSQLAlchemyを使っているため、実際には非同期の恩恵を受けていません。完全な非同期化には `async-sqlalchemy` や `databases` ライブラリが必要です。\n\n注意: `async` はマルチスレッドではありません。シングルスレッドのイベントループ上で、I/O待ちの間に他の処理を挟む仕組みです。",
            difficulty: "red",
            cAnalogies: [
              {
                concept: "async/await",
                cEquivalent: "ノンブロッキングI/O + イベントループ",
                detail:
                  "awaitはepoll/selectでI/O完了を待つのと同じ原理です。スレッドを使わず、1つのループで複数の処理を効率的に回します。",
                warning:
                  "async/awaitはスレッドではありません。pthread_createとは全く異なる仕組みです。",
              },
            ],
          },
          {
            id: "todos-crud",
            title: "CRUDパターンとREST設計",
            startLine: 8,
            endLine: 22,
            content:
              "REST（Representational State Transfer）はWeb APIの設計原則です。\n\n- GET /todos → Read（一覧取得）\n- POST /todos → Create（新規作成）\n- DELETE /todos/{id} → Delete（削除）\n\nこの設計では「リソース（/todos）」に対して「操作（HTTPメソッド）」を組み合わせることで、直感的なAPI設計が実現されています。",
            difficulty: "red",
          },
        ],
      },
    },
  },
  {
    filePath: "todo_app/database.py",
    explanations: {
      beginner: {
        summary:
          "このファイルはデータベースとの接続を管理しています。データの保存先であるSQLiteデータベースへのアクセス方法を定義します。",
        sections: [
          {
            id: "db-engine",
            title: "データベースへの接続",
            startLine: 4,
            endLine: 5,
            content:
              "`create_engine(\"sqlite:///todos.db\")` はSQLiteデータベースファイルへの接続を作成します。SQLiteはファイル1つで動くシンプルなデータベースです。`sessionmaker` は「データベースへの問い合わせを実行するための窓口」を作る仕組みです。",
            difficulty: "green",
          },
          {
            id: "db-getdb",
            title: "データベース接続の取得と解放",
            startLine: 7,
            endLine: 11,
            content:
              "`get_db()` 関数はデータベースとの接続を管理します。`try/finally` 構文は「処理が成功しても失敗しても、必ず最後に `db.close()` を実行する」安全装置です。ファイルを開いたら必ず閉じるのと同じ考え方です。",
            difficulty: "green",
          },
        ],
      },
      intermediate: {
        summary:
          "SQLAlchemyのエンジン/セッション管理とPythonのジェネレータを使ったリソース管理パターンを理解します。",
        sections: [
          {
            id: "db-session",
            title: "Engine と SessionLocal",
            startLine: 4,
            endLine: 5,
            content:
              "`Engine` はデータベースへの接続プールを管理するオブジェクトです。`sessionmaker(bind=engine)` はファクトリパターンで、呼び出すたびに新しいセッション（DB操作の単位）を生成します。セッションはトランザクション管理も担当し、`commit()` で変更を確定、`rollback()` で取り消しが可能です。",
            difficulty: "amber",
          },
          {
            id: "db-yield",
            title: "yield によるジェネレータ関数",
            startLine: 7,
            endLine: 11,
            content:
              "`yield db` はこの関数をジェネレータに変えます。通常の `return` と違い、`yield` の地点で一時停止し、呼び出し元に値を渡します。FastAPIの `Depends` はこのパターンを利用して:\n\n1. `yield` の前 → セットアップ（DB接続取得）\n2. `yield` で呼び出し元に接続を渡す\n3. `yield` の後（finally）→ クリーンアップ（DB接続解放）\n\nPythonでよく使われるリソース管理パターンです。",
            difficulty: "amber",
            cAnalogies: [
              {
                concept: "yield（ジェネレータ）",
                cEquivalent: "コールバック + クリーンアップ関数",
                detail:
                  "yieldの前後でリソースの取得と解放を行うパターンは、Cのgoto cleanupパターンに近い発想です。",
                cCodeSnippet:
                  "// Cでのリソース管理パターン\ndb_t *db = db_open();\nif (!db) goto cleanup;\n// ... 処理 ...\ncleanup:\n    if (db) db_close(db);",
              },
            ],
          },
        ],
      },
      advanced: {
        summary:
          "ORMのセッション管理、コネクションプール、トランザクション分離レベルを理解します。",
        sections: [
          {
            id: "db-pool",
            title: "コネクションプールとORM",
            startLine: 4,
            endLine: 11,
            content:
              "SQLAlchemyの `Engine` は内部でコネクションプールを管理しています。リクエストごとにDB接続を新規作成するのではなく、プールから再利用することで接続コストを削減します。\n\nデフォルトのプールサイズは5で、最大10まで拡張可能です。プール枯渇時はタイムアウトまで待機します。\n\nORM（Object-Relational Mapping）はPythonオブジェクトとデータベースのテーブルを自動でマッピングする層です。SQLを直接書かずに、Pythonのメソッド呼び出しでCRUD操作ができます。",
            difficulty: "red",
            cAnalogies: [
              {
                concept: "コネクションプール",
                cEquivalent: "接続の配列 + 使用中フラグ管理",
                detail:
                  "あらかじめ複数のDB接続を確保しておき、必要な時に借りて返す仕組みです。",
                cCodeSnippet:
                  "#define POOL_SIZE 5\nsqlite3 *pool[POOL_SIZE];\nint in_use[POOL_SIZE] = {0};\n\nsqlite3 *acquire() {\n    for (int i = 0; i < POOL_SIZE; i++)\n        if (!in_use[i]) { in_use[i]=1; return pool[i]; }\n    return NULL; // プール枯渇\n}",
              },
            ],
          },
        ],
      },
    },
  },
];
