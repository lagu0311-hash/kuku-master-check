# QA記録：v1.4 第2段階（未公開・開発ブランチ）

2026-11-08。下段には歴史的なv1.2以前のQAを残しています。旧記録の仕様や数値はv1.4の合格条件ではありません。

**実施済み**
- `npm test`：16件PASS、0 FAIL（ご褒美16回、81/81判定、v4保存形式／旧版拒否、重複防止、81問の一意性など）
- `node --check docs/app.js` と `node --check docs/core.js`：PASS
- Chromium 144へのオフラインHTML／JavaScript注入によるDOM操作試験：ホーム、3種の練習、力試し81問、ルビ、回答保存、練習9問完走、力試し81問満点完走と9問ごとの休憩、ご褒美1/4表示、練習結果のご褒美ボタン非表示、リセット成功・失敗、旧v3キーの不採用を確認。例外0。
- `docs/animals.js` と既存ご褒美8SVG、`docs/index.html`：第2段階では改変なし。

**未実施／保留**
- Chromeの管理制限により、Chromiumから`http://127.0.0.1`の直接UIアクセスは不可。オフライン注入試験は実配信や画像アセット描画を保証しない。
- AndroidタブレットChrome・iPhone Safariなどの実機目視、2×2の断片位置と完成絵のアニメーションの表示確認は未実施。
- オリジナル動物イラストC05の実装と全ポーズ・両腕の構造確認は第3段階。
- `main`統合、GitHub Pages公開は未実施。

---

# QA実施記録 / 2026-11-08

## 実行済み（PASS）

- Node.js v22 `npm test`: 13件 PASS
- `node --check docs/app.js`: 構文OK
- `node --check docs/core.js`: 構文OK
- ローカルHTTPサーバー経由のトップページ応答: HTTP 200

テストの対象：81問の順序付き一意性、段別・全問・まぜこぜの出題数、異なる日の習得判定、直近誤答での状態変更、弱点の優先抽出、段別集計、JSON値検証、CSV変換、日付。

## v1.2追加テスト（PASS）

- 点数帯境界（0、40、60、80、100%）、満点9マス解放、解放順と重複処理、9マス上限、旧v1 JSONの移行を含む合計13件のNodeテストPASS。
- ChromiumをオフラインHTML注入で操作した簡易試験：ホーム→練習→不正解の動物画面→次問題→途中再開→ちからだめし9問満点→ごほうび1/4マス開放→ごほうびページ表示でJS例外ゼロ（端末実機／GitHub Pages配信の保証ではない）。
- 環境のナビゲーション制約（`ERR_BLOCKED_BY_ADMINISTRATOR`）により、Chromiumから`http://127.0.0.1`に直接アクセスする方式は不可。テスト時はHTML/CSS/JSをブラウザへ直接注入して動作を確認した。

## GitHub公開後・実機での確認が必要

1. AndroidタブレットChromeを最優先、iPhone Safari・iPad Safari・PCブラウザで画面崩れがないこと
2. 子ども用の数字ボタンとPCの数字キー／Enter／Backspaceで回答できること
3. 1問回答→リロード→続きから再開できること
4. ちからだめしでは途中の正誤が表示されないこと
5. 練習では1問ごとに正解が表示されること
6. 81問では9問ごとに休憩になること
7. JSON保存・別端末での読み込み・CSV出力ができること
8. ブラウザを閉じたりバックグラウンドにした時間が回答時間に加算されないこと

ブラウザ自動テストを試みたが、実行環境のブラウザがローカルURLを管理ポリシーで拒否したため、画面操作テストは未完了。上記のPASSは実機動作確認を意味しない。

9. Android Chromeで紙吹雪・動物アニメーション・ごほうび絵（4マス中1マス）が正しく表示されること
10. 演出ふつう／ひかえめ／オフの切り替えと、完成済み9マスの保存・復元


## 第3段階：採用原画を用いたイラスト再実装（2026-11-08）

- 前回の独自SVG描画版は絵柄が採用原画と異なるため棄却。第2段階の機能コードへ戻し、採用済み原画から11点のWebPを抽出して再構築。
- 変更対象：`docs/animals.js`、`docs/app.js`のホーム猫呼び出し1箇所、`docs/styles.css`のイラスト関連CSS、`tests/core.test.mjs`の素材テスト、`docs/assets/characters/*.webp`、関連仕様文書だけ。`docs/core.js`・8点の既存ご褒美SVG・`docs/index.html`は不変更。
- ブラウザ試験：オフラインにコード・画像を読み込んだChromiumでホーム→練習→正解演出を操作。画像ロード・DOM構造・JavaScript例外ゼロを確認。ChromeローカルHTTP制限による代替のため、HTTP実配信やAndroid実機の試験と区別する。
- 試験：`npm test`、`node --check docs/app.js`、`node --check docs/animals.js`、WebPファイルの実在・可読性を検証。
- 未完了：Android Chromeでのタップ操作とデザイン実寸確認、全種類・全ポーズの目視採否、GitHub Pagesへの本番配信・公開。

## 追加：漢字・ルビ修正の検証（2026-11-08、作業ブランチ）

- 合意済み表記への置換とruby辞書の追加を`docs/app.js`に限定。`何の絵`／`何の段`を「なん」、`何問`を「なんもん」に固定。単独の`何`・`分`の読みに一律の辞書を登録しない。
- ネイティブプルダウンの選択肢、`data-action`、`aria-label`、保護者画面のルビなし、指定された「おうちのひと」「よくできたね！」を維持する。
- 既存機能テストに加え、漢字・ルビの静的回帰テストを追加。ChromiumではオフラインHTML注入によってホーム・練習選択・苦手克服・回答／正誤画面・力試し・結果・ご褒美・私の記録・保護者画面で漢字とルビを点検する。
- Android Chrome／iPhone Safariの実機表示は引き続き未実施。GitHub Pages本番配信も未実施。

## 2026-11-08 C05 応援・筋トレ演出の限定修復（未公開）

対象：開発ブランチ `work/v1.4-kanji-ruby-20261108` のコミット `80fb8b7a06a080796077022d6e4b77cbb9858c64` を固定基準として局所修正。

- 動物の承認済み WebP 11点の画像バイトは変更なし。新キャラクター描画・ご褒美原画変更なし。
- `dog/weights`：承認済み犬の画像に、パステル色のダンベルを両前足付近へ重ねる。動物画像自体は改変しない。
- `dog/coach`、`rabbit/coach`、`squirrel/coach`：各承認済み原画と「ファイト！」の吹き出しを組み合わせる。
- `cat/coach`：承認済みジャンプポーズ＋同じ応援吹き出し。黒板付きの別のポーズは表示切れと無関係な固定の九九式が見えるため採用しない。
- `animalSvg(type,pose)` の既存引数・キャラクター名・画像参照・アニメーションクラスを維持。アニメーション設定 off と `prefers-reduced-motion` も維持。
- 新規 `tests/animal-poses.test.mjs` に4テスト追加。既存 `tests/core.test.mjs` の一箇所のみ、動物をSVGで描き直さないテストが**小物のSVG**を許容するよう適切に調整。動物本体を描画コードへ置換することは許可しない。

検証（ローカル環境）：`npm test` **24/24 PASS**。`node --check` 3件 PASS。ブラウザ内モック操作 **33/33 + 13/13 PASS**。5演出の画像読み込み・目視確認済み。作業ブランチ上での実HTTP配信、GitHub Pagesの本番動作、Android Chrome実機確認は**未実施**。画像見本の所有者による最終視覚確認も未了。

**公開判断：HOLD（作業ブランチに限定）。** 監査対象の完成絵の表示、Android Chrome実機での表示・入力・動作の確認、所有者の公開承認が揃うまで `main` へ統合しない。

## 2026-11-08 筋トレ／応援ポーズの原画限定差し替え（未公開）

- 直前のC05小道具合成版は利用者の追加選択により不採用。新しい原画 `a_bright_watercolor_style_illustrated_update_repo.png` の**動物部分だけ**を抽出し、8点の `*-alt.webp` として格納した。背景、数値、公開判定の文字は一切使用しない。
- `weights/coach` の画像参照以外は変更しない。犬の小さな後付けダンベル、吹き出しのSVG/CSSは撤去。
- 背景透過で犬の耳を一部誤除去した試作品は不採用。犬の耳の領域を保護して切り出し直し、全8点の輪郭を一覧で目視確認した。
- 保存ロジック、81問、ルビ、既存のホーム・正解画像11点、ご褒美原画8点のSHAを固定して独立照合する。
- `npm test`、`node --check`、Chromium内画像描画・読み込み、GitHub差分の確認は実施記録に基づき報告する。**Android Chrome実機の確認と本番公開は今回行わない。**

**追加検証（限定差し替え）**：`npm test` は **29/29 PASS**、`node --check`（app/core/animals）PASS。ChromiumのオフラインDOM試験 **33/33 + 13/13 PASS**、8素材の描画・読み込み **8/8 PASS**。Android Chrome実機とGitHub Pages実配信は引き続き未実施。

**採用参照画像 SHA-256**：`4c128e5520ebace68fe9382780c2cda5a82413527754cd8dbe4704adaf53cfa3`。切り出し素材：

- `cat-coach-alt.webp`：30664 bytes、SHA-256 `47be98cb0af182e7feb996f029ddac3bcb055125fddd264161320c4be7e2c94f`
- `cat-weights-alt.webp`：25818 bytes、SHA-256 `b4cadaac9b63b299cfab8b577fee967cfda1eadff10e1ae68600d6d465da85c0`
- `dog-coach-alt.webp`：29656 bytes、SHA-256 `3345624868ea77db8e3b6ad339dcb3f3f8f230a3d962a8ae959cefadf36422f0`
- `dog-weights-alt.webp`：32280 bytes、SHA-256 `7fa843b2abed5decb0dd11177bcd84d7eb973104810f227a2bb885fcb289155d`
- `rabbit-coach-alt.webp`：26800 bytes、SHA-256 `8fdf73cf28ca582e0ff4b21600ead3c8278f37eeea0edc452c76edd1c1b1743c`
- `rabbit-weights-alt.webp`：25020 bytes、SHA-256 `141cf19d51d9df0651c45f930b4ed8963b28869bb07a441dd0699bc5e15cedaf`
- `squirrel-coach-alt.webp`：25400 bytes、SHA-256 `0c4ba2d59541402d5ba40743b383398d80728dd255bcfdeecead2f4fc64579f0`
- `squirrel-weights-alt.webp`：28278 bytes、SHA-256 `f565d69f0323cb00f34cf9fc9810109d8f2e30f1b7050bdd84127fe74c79730e`

最終公開判断：**HOLD**（既存公開v1.3を維持）。
