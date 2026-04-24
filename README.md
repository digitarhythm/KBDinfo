# KBDinfo

Keyboard Layout Editor（KLE）の RAW データを QMK Firmware の `info.json` に変換するブラウザ専用ツール。

`https://qmk.fm/converter/` の代替として、ブラウザ内で完全に動作し、GitHub Pages にホスティングする静的 Web アプリです。

## 特徴

- **サーバー非依存** — すべてブラウザ内で変換処理が完結します
- **KLE 全機能サポート** — 回転、二次矩形、decal、ghost 等を認識
- **対話的 matrix 編集** — プレビュー上でキーをクリックして row/col を割り当て
- **自動採番** — 行優先／列優先で matrix 座標を自動生成
- **メタデータフォーム** — QMK 固有のメタ情報を GUI で編集
- **警告表示** — QMK スキーマに収まらない情報を明示

## 必要環境

- Node.js **24.x**（`.node-version` / `.nvmrc` で `24.4.1` をピン）
- npm 11 以上

## 開発手順

```bash
# Node 24 をアクティブに（nodenv を使用する場合は自動切替）
node --version   # v24.4.1

# 依存インストール
npm install

# 開発サーバ起動（http://localhost:5173）
npm run dev

# 単体テスト実行
npm test

# 本番ビルド（TypeScript 型チェック含む）
npm run build

# 本番ビルドのプレビュー
npm run preview
```

## 使い方

1. keyboard-layout-editor.com でレイアウトを作成
2. 「Raw data」タブの内容をコピー
3. KBDinfo の入力欄に貼り付け
4. プレビューで各キーをクリックし、右側パネルで matrix を編集（または「行優先で自動採番」）
5. メタデータフォームで keyboard_name、USB VID/PID、matrix_pins 等を入力
6. 「ダウンロード」または「コピー」で `info.json` を取得

## ディレクトリ構成

```
src/
├── converter/        # 純関数変換ロジック（Vue非依存）
├── stores/           # Pinia ストア
├── composables/      # Vue コンポーザブル
├── components/       # Vue SFC
└── types/            # TypeScript 型定義
docs/                 # 要件定義書・仕様書・設計書（BOM UTF-8）
tests/                # Vitest テスト
```

## デプロイ

`main` ブランチへの push で GitHub Actions（`.github/workflows/pages.yml`）が自動ビルド・Pages 公開します。

リポジトリ設定 → Pages → Source を **GitHub Actions** にしてください。

## ライセンス

[MIT License](./LICENSE) — Copyright (c) 2026 digitarhythm

依存ライブラリの `@ijprest/kle-serial` も MIT ライセンスです。
