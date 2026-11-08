# 九九マスターチェック v1.4 — 正式水彩原画4枚の限定実装追補

作成日：2026-11-09／状態：**LOCAL REVIEW READY / GitHub未書込 / v1.4未公開 / 本番v1.3維持**

## 基準と目的

- 開発基準：`lagu0311-hash/kuku-master-check`、固定SHA `595d7e5e118b9fbe1458a1448281619889df12cb`（未公開v1.4）。
- 原本：`kuku_master_check_SELF_CONTAINED_HANDOFF_20261109.zip`、SHA-256 `b86030a14ca10d43fe800c7ea93560324abdb6d41527543c36955749978711c4`。
- 4作品のID・順：`flower-cat`、`starry-cat`、`picnic-friends`、`balloon-cat` を維持。
- 正式採用のJPEGを画素加工・切り取り・再エンコードせず、そのまま `docs/assets/rewards/` に複製する。
- 既存の満点判定・2×2タイル進捗・ランダム開放・schema v4・学習ロジック・通常動物原画は維持。

## JPEG原画の来歴（新アセット先。全1254×1254）

| ID | 配信ファイル名 | bytes | SHA-256 |
|---|---|---:|---|
| flower-cat | `01_flower_cat__7D87821B-0515-4E82-B91C-AFCD6444CC38.jpeg` | 872288 | `ee6048851351503c348d6f860b1de89f0cfe8109c43f6fa4da8070e7593dc883` |
| starry-cat | `02_starry_cat__E011D51A-3ACD-4527-A4D8-2C1536AE6F7E.jpeg` | 946773 | `3dd2cb20e82b65b0705f1fd1d68c4c4baf8e8cb34281c5609b32520b34ae530e` |
| picnic-friends | `03_picnic_friends__1067876E-2918-4A31-98E9-E59F62885D4E.jpeg` | 817595 | `3b0d43f376a31479f918e78928dbd5b7eadce9613033697d0570443e95283320` |
| balloon-cat | `04_balloon_cat__751C9A4F-F0E0-4CBF-8F8C-A6E1B398D1A1.jpeg` | 855521 | `da85caa1e94ba4dc882d5a2c28cfe1205fff93580373d59577635cabecb92ee3` |

旧`docs/assets/reward-*.svg` 8点は歴史的な資料として保持したが、今回のご褒美表示からの参照は外した。通常動物WebP、保存schema、他の画面は変更していない。

## 変更範囲

- `docs/core.js`：`REWARD_PICTURES` の**imageパスのみ**変更。ID・順は不変。
- `docs/app.js`：同一原画を2×2静止タイル、完成パネル、完成コレクションで表示。完成パネル／完成ギャラリーだけCSSオーバーレイを描画。オフ設定では開放アニメーションを行わない。
- `docs/styles.css`：完成原画を移動・拡大しない。花びら／星／木漏れ日／光の透明CSSレイヤー。ひかえめは各絵1要素のみ、オフ・OS reduced-motionでは新レイヤーを非表示。外部JS・外部画像要求・ランダムタイマーなし。
- `docs/assets/rewards/*.jpeg`：承認原画4点を無改変で追加。
- `tests/reward-artwork.test.mjs`：JPEG raw SHA256/byte数・対応ID・OSモーション・新規表示条件を回帰確認。

## 注意と検証範囲

- 単体 `npm test`：既存29＋追加6、**35/35 PASS**。
- 端末幅320/390/768px × 作品4 × 進捗1,2,3,4 × 演出 normal/low/off＝**オフラインChromium DOM 144ケース PASS**。画像表示・縦横比・横溢れ・完了数・マス数・画像表示を確認。OS reduced-motion（3幅）確認。
- このChromium試験は**ローカルのコードをDOMへ注入した独立確認**。ローカルHTTP実配信試験でもAndroid Chrome実機試験でもない。画像URIはテストハーネス内で同じJPEG bytesの `data:` URIに置換して確認した。
- JPEG4点の追加転送量は約3.5MB（未圧縮サイズ計3,492,177 bytes）。画像を再圧縮せず原画の品質維持を優先。ギャラリーの画像には `loading=lazy` を設定。
- Android実機・GitHub Pages実配信・公開承認は未了。**mainへの書込／公開は禁止**。

## 次のゲート

1. 所有者が添付プレビューの絵柄・アニメーション方向性を確認。
2. 承認後、GitHub `main` ではない専用開発ブランチへ限定差分を保全。
3. Android Chrome実機でスクロール、2×2、完成ギャラリー、モーション設定、端末データ保持を確認。
4. 所有者の明示承認が出るまで公開HOLD。
