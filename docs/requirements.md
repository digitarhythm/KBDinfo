# KBDinfo 要件定義書

## 1. 背景と目的

QMK Firmware 公式の Web 変換ツール `https://qmk.fm/converter/` は、Keyboard Layout Editor（以下 KLE）の RAW データから QMK の `info.json`（旧 `keyboard.json`）を生成する用途で広く利用されている。しかし同サービスは時折ダウンしており、作業者（自作キーボード設計者）が定義ファイルを用意する際にブロッカーとなる。

本プロジェクト **KBDinfo** は、同等機能を**完全にブラウザ内で動作する静的 Web ツール**として実装し、GitHub Pages で無料ホスティングすることで、外部 API 障害に左右されない恒久的な代替手段を提供する。

## 2. 対象ユーザー

- 自作キーボードの PCB 設計者・ファーム開発者
- QMK ベースのキーボードを登録・維持するユーザー
- KLE で物理配置を定義し、QMK に持ち込む全ての開発者

## 3. 対象範囲

### 3.1 機能要件

| ID | 要件 |
|---|---|
| F-01 | KLE の RAW JSON（keyboard-layout-editor.com「Raw data」タブの内容）を入力として受け付ける |
| F-02 | テキストエリアへの貼付、ファイル読込、サンプル読込の3経路で入力できる |
| F-03 | 入力を `@ijprest/kle-serial` でパースし、QMK `info.json` 形式に変換する |
| F-04 | プレビュー領域に SVG でキー配置を描画する（回転、二次矩形、decal、ghost 含む） |
| F-05 | プレビュー上でキーをクリックして選択し、matrix（row,col）を対話編集できる |
| F-06 | 「行優先/列優先」の一括自動採番機能を提供する |
| F-07 | KLE メタデータ（name, author, notes）を自動抽出し、メタデータフォームの初期値にする |
| F-08 | QMK 固有のメタデータ（manufacturer, usb.vid/pid, matrix_pins, diode_direction, features, processor, bootloader）を手動入力できる |
| F-09 | 変換結果 `info.json` をテキスト表示し、クリップボードコピーとファイルダウンロードができる |
| F-10 | QMK スキーマで扱えない情報（x2/y2/w2/h2、switchMount 等）について警告を一覧表示する |
| F-11 | 入力から出力までの全処理をブラウザ内で完結させる（サーバー・外部 API 非依存） |

### 3.2 非機能要件

| ID | 要件 |
|---|---|
| N-01 | GitHub Pages で動作すること（静的ビルド成果物のみで完結） |
| N-02 | Node.js 24.x で開発・ビルドできること |
| N-03 | ビルド時・実行時ともに警告ゼロ（deprecated、脆弱性含む） |
| N-04 | 単体テストで変換ロジックを検証し、主要な分岐を網羅すること |
| N-05 | BOM 付き UTF-8 Markdown で要件定義書・仕様書・設計書を管理すること |
| N-06 | 日本語UI を基本とし、技術用語は原語を併記すること |

## 4. 除外事項

- QMK `keymap.c` の生成（`info.json` 範囲のみ）
- `LAYOUT_all` 等の派生レイアウト自動生成（単一 `LAYOUT` を出力）
- サーバーサイド機能（アカウント、履歴、共有URL等）
- 多言語対応（まずは日本語のみ）

## 5. 成果物

- 静的 Web アプリ（GitHub Pages にデプロイされた HTML/JS/CSS バンドル）
- ソース一式（Vue 3 + TypeScript + Tailwind CSS + Vite）
- 本ドキュメント群（要件定義書・仕様書・設計書）
- 単体テストスイート（Vitest）
- GitHub Actions ワークフロー（ビルド＋デプロイ自動化）

## 6. 用語定義

| 用語 | 意味 |
|---|---|
| KLE | Keyboard Layout Editor（keyboard-layout-editor.com） |
| KLE RAW | KLE の「Raw data」タブで得られる JSON 配列形式 |
| info.json | QMK Firmware のキーボード定義 JSON（旧名 keyboard.json） |
| matrix | キースイッチの電気的配線上の row/col 座標 |
| decal | KLE でラベルのみ表示する「キーではない装飾」の扱い |
| 二次矩形 | ISO Enter / ステップドキーなど非矩形キーの副矩形 (x2/y2/w2/h2) |
| クロードコード | Claude Code コーディング補助エージェントの呼称 |
| 作業者 | 本プロジェクトの開発指示者 |
