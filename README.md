# ChromaDB Markdown Search

TypeScriptで実装されたMarkdownファイル検索アプリケーション。ChromaDBを使用してベクトルデータベースを構築し、OpenAIのembedding APIを使用してテキストをベクトル化します。

## 機能

- ローカルのMarkdownファイルからテキストを抽出
- OpenAIのtext-embedding-3-smallモデルを使用してテキストをベクトル化
- ChromaDBを使用してベクトルデータを永続化
- キーワードや文章による類似検索

## 前提条件

- Node.js (v18以上)
- pnpm
- Docker と Docker Compose
- OpenAI API キー

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd playground-cromadb
```

### 2. 依存関係のインストール

```bash
pnpm install
```

### 3. 環境変数の設定

`.env`ファイルをプロジェクトルートに作成し、以下の内容を追加します：

```
OPENAI_API_KEY=your_openai_api_key
```

### 4. ChromaDBサーバーの起動

Docker Composeを使用してChromaDBサーバーを起動します：

```bash
docker compose up -d
```

## 使用方法

### アプリケーションの実行

```bash
# TypeScriptのコンパイル
pnpm build

# アプリケーションの実行
node dist/index.js

# または開発モードで実行
pnpm dev
```

### 検索

アプリケーションを実行すると、CLIインターフェースが表示されます。検索クエリを入力して、類似するMarkdownコンテンツを検索できます。

### ChromaDBサーバーの停止

```bash
docker compose down
```

## プロジェクト構成

```
/playground-cromadb
  ├── .env                      # 環境変数
  ├── package.json              # npmパッケージ設定
  ├── tsconfig.json             # TypeScript設定
  ├── docker-compose.yml        # Docker設定
  ├── src/
  │   ├── index.ts              # エントリーポイント
  │   ├── config.ts             # 設定管理
  │   ├── db/
  │   │   ├── chroma-client.ts  # ChromaDBクライアント
  │   │   └── collections.ts    # コレクション管理
  │   ├── embedding/
  │   │   └── openai.ts         # OpenAI Embedding管理
  │   ├── markdown/
  │   │   ├── loader.ts         # Markdownファイルローダー
  │   │   └── parser.ts         # Markdownパーサー
  │   └── search/
  │       └── query.ts          # 検索ロジック
  ├── data/
  │   └── markdown/             # サンプルMarkdownファイル
  ├── chroma_db/                # ChromaDB永続化ストレージ（Dockerにマウント）
  └── dist/                     # コンパイル済みJavaScriptファイル
```

## アーキテクチャ

```
TypeScriptアプリケーション --> HTTP API (port 8080) --> ChromaDB Dockerコンテナ
                          |
                          v
                      OpenAI API
```

1. TypeScriptアプリケーションがMarkdownファイルを読み込み
2. OpenAI APIを使用してテキストをベクトル化
3. HTTP経由（ポート8080）でChromaDBコンテナに接続し、ベクトルデータを保存
4. 検索クエリもベクトル化し、類似検索を実行

## トラブルシューティング

- **OPENAI_API_KEY not set error**: .envファイルにAPIキーが正しく設定されているか確認してください。
- **ChromaDB client connection error**: ChromaDBサーバーが起動しているか確認してください。`docker compose ps`で状態を確認できます。
- **Database permission errors**: chroma_dbディレクトリの権限を確認してください。
- **Database corruption**: 問題が発生した場合は、`chroma_db`ディレクトリを削除して新しく作成することができますが、すべてのインデックスデータが削除されることに注意してください。
