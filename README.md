# KBDinfo

- [GitHub Pages](https://digitarhythm.github.io/KBDinfo)

Keyboard Layout Editor（KLE）の RAW データを QMK Firmware の `info.json` に変換するブラウザ専用ツール。

公開先: **https://digitarhythm.github.io/KBDinfo/**

`https://qmk.fm/converter/` の代替として、ブラウザ内で完全に動作する静的 Web アプリです。GitHub Pages にホスティングしているため、外部 API のダウンに左右されません。

## 特徴

- **サーバー非依存** — すべてブラウザ内で変換処理が完結
- **KLE 全機能サポート** — 回転、二次矩形、decal、ghost、回転クラスタ（rx/ry）等を正確にパース
- **2形式入力対応** — KLE の「Raw data」タブと「Download JSON」のどちらでもそのまま貼付可能
- **対話的 matrix 編集** — プレビュー上でキーをクリックして row/col を上書き
- **キー削除機能** — 設定から特定キーを除外（プレビューに残しつつ出力 layout から外す）
- **可視性エラー表示**
  - 🔴 KLE ラベルが `row,col` 形式でないキー（赤）
  - 🟡 matrix 値が他キーと重複しているキー（黄）
- **包括的メタデータフォーム** — 6カード構成で QMK 固有の項目を網羅
  - メタデータ、キーマトリクス、オプション、ロータリーエンコーダー、RGB Matrix、分割キーボード
- **コンパクトな JSON 出力** — `layout` 配列は1キー1行の標準的な QMK 風整形
- **警告表示** — QMK スキーマに収まらない情報を明示（重複 matrix、二次矩形ドロップ、KLE固有項目等）

## 入力形式

KLE の以下2形式に対応します:

### Download JSON 形式
```json
[
  {"name": "Sample"},
  ["0,0", "0,1"],
  ["1,0", "1,1"]
]
```

### Raw data タブ形式（外側 `[]` 無し）
```json
{name: "Sample"},
["0,0", "0,1"],
["1,0", "1,1"]
```

JSON5 構文（unquoted key、末尾カンマ）も受付可能です。

## matrix の扱い

- KLE のキーラベル先頭行が `row,col`（カンマ区切り）形式なら、そのまま `matrix: [row, col]` として出力
- それ以外（`5.6` や `Esc` 等）は配列として保持: `matrix: [5.6]` / `matrix: ["Esc"]`
- 右ペインの「matrix 編集」で override すれば、出力 JSON 上の matrix が確定値で書き換わります

出力例:
```json
"layout": [
    {"matrix":[0,0], "x":0, "y":0},
    {"matrix":[0,1], "x":1, "y":0},
    {"matrix":[5.6], "x":2, "y":0},
    {"matrix":["Esc"], "x":3, "y":0}
]
```

## 必要環境

- Node.js **24.x**（`.node-version` / `.nvmrc` で `24.4.1` をピン）
- npm 11 以上

## 開発手順

```bash
# Node 24 をアクティブに（nodenv 使用なら自動切替）
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
2. 「Raw data」タブの内容をコピー、または「Download JSON」を押下
3. KBDinfo の入力欄に貼り付け（または「JSON読み込み」でファイル選択）
4. **「変換」ボタンをクリック** → プレビューが表示される（テキストエリアはロックされる）
5. プレビューで各キーをクリックし、右ペイン「matrix 編集」で row/col を上書き
6. 不要なキーは「設定から削除」ボタンで除外
7. 6カードのメタデータフォームで keyboard_name / USB / matrix_pins / encoder / RGB matrix / split など必要項目を入力
8. 「ダウンロード」または「コピー」で `info.json` を取得
9. 別レイアウトに切り替えるには「クリア」を押下

## メタデータフォーム構成

右ペインは以下6カードで整理:

| カード | 主な項目 |
|---|---|
| 🧾 メタデータ | keyboard_name / manufacturer / maintainer / url / USB VID, PID, device_version |
| ⚙️ キーマトリクス | matrix_pins.rows, cols / diode_direction / debounce / processor / bootloader |
| 🎛️ オプション | features 各種フラグ |
| 🔄 ロータリーエンコーダー | pin_a / pin_b / resolution（複数登録可） |
| 💡 RGBマトリクス | driver / led_count / ws2812.pin / max_brightness / sleep / timeout / hue/sat/val/speed_steps / animations 47種 / default(animation/hue/sat/val/speed) / split_count |
| 🔗 分割キーボード設定 | bootmagic.matrix / handedness.pin / split.matrix_pins.right / serial.driver, pin / split.encoder.right.rotary |

RGB Matrix と 分割キーボード設定は `enabled` トグルで内容を展開します。

## KLE パーサについて

`@ijprest/kle-serial` 0.15.1 には rx/ry 指定時にカーソル座標がリセットされないバグがあるため、KBDinfo は **自前パーサ** (`src/kle/serial.ts`) を実装しています。
このパーサは独立ライブラリとしても公開されています:

- npm: [`kle-serial-alt`](https://www.npmjs.com/package/kle-serial-alt)
- GitHub: [digitarhythm/kle-serial-alt](https://github.com/digitarhythm/kle-serial-alt)

## ディレクトリ構成

```
src/
├── converter/        # 純関数変換ロジック（Vue 非依存）
│   ├── buildLayout.ts    # KLE Keyboard → QMK layout[]
│   ├── buildMetadata.ts  # フォーム → InfoJson メタ部
│   ├── extractMatrix.ts  # ラベル row,col 解析
│   ├── parseKle.ts       # 入力（Raw / Download）パース
│   ├── serialize.ts      # info.json 整形
│   ├── warnings.ts       # 警告収集
│   └── index.ts          # 公開 API
├── kle/serial.ts     # KLE 自前パーサ
├── stores/           # Pinia ストア
├── composables/      # SVG ジオメトリ等
├── components/       # Vue SFC
├── types/            # TypeScript 型 + RGB アニメーション一覧
├── App.vue           # ルートレイアウト
└── style.css         # Tailwind カスタム
docs/                 # 要件定義書・仕様書・設計書（BOM UTF-8）
tests/                # Vitest テスト（80 件）
.github/workflows/    # GitHub Pages 自動デプロイ
```

## デプロイ

`main` ブランチへの push で GitHub Actions（`.github/workflows/pages.yml`）が自動ビルド・Pages 公開します。

リポジトリ設定 → Pages → Source を **GitHub Actions** にしてください。

## バージョニング

- `chore: release vX.Y.Z` のコミットと `vX.Y.Z` アノテートタグで公開履歴を管理
- フッターにバージョン番号を自動表示（`vite.config.ts` で `package.json` から埋め込み）

## ライセンス

[MIT License](./LICENSE) — Copyright (c) 2026 digitarhythm

依存ライブラリの `kle-serial-alt` (MIT) や `@ijprest/kle-serial` (MIT) を参考に開発しています。
