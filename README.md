# diary_print

## フォント運用ポリシー

- `public/fonts/NotoSansJP-Regular.ttf` はリポジトリに含めません（バイナリファイル非対応のため）。
- 日本語描画用フォントは実行時に以下 URL から取得し、`/tmp` に保存して再利用します。
  - `https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/SubsetOTF/JP/NotoSansJP-Regular.otf`
- サーバ側画像生成時は `@napi-rs/canvas` の `GlobalFonts.registerFromPath(...)` でフォント登録してください。
- ネットワーク不可環境ではフォント取得に失敗し、日本語描画が崩れる可能性があります。
