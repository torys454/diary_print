import { buildPreviewStickers } from "@/lib/stickers";

export default function HomePage() {
  const stickers = buildPreviewStickers("今日は新しい習慣を始めた");

  return (
    <main className="container">
      <h1>Diary Sticker Maker MVP</h1>
      <p>日記テキストをスタンプ風カードに変換して印刷できます。</p>
      <section className="grid">
        {stickers.map((sticker) => (
          <article key={sticker.id} className="card">
            <h2>{sticker.label}</h2>
            <p>{sticker.preview}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
