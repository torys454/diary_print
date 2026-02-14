'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

type PrintType = 'sticker' | 'paper';
type StoreType = 'familymart' | 'lawson';
type SizeType = 'L' | '2L';

type SplitResult = { index: number; dataUrl: string };

const PREFECTURES = [
  '北海道', '東京都', '神奈川県', '愛知県', '大阪府', '福岡県', '沖縄県'
];

const PROMPT_TEXT = `やさしい手書き風の日記コラージュ画像を作成してください。\n縦横比は 7:3 で、横方向に1日ずつ区切れる余白を入れてください。\n雰囲気はシンプル、淡い色、かわいいデコ。`;

export default function Home() {
  const [showGuide, setShowGuide] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [days, setDays] = useState(3);
  const [printType, setPrintType] = useState<PrintType>('paper');
  const [store, setStore] = useState<StoreType>('familymart');
  const [size, setSize] = useState<SizeType>('L');
  const [includeDate, setIncludeDate] = useState<'yes' | 'no'>('yes');
  const [prefecture, setPrefecture] = useState('東京都');
  const [weather, setWeather] = useState('');
  const [splitPieces, setSplitPieces] = useState<SplitResult[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem('diary-guide-hidden');
    if (!hidden) {
      setShowGuide(true);
    }
  }, []);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const loadWeather = async () => {
      const res = await fetch(`/api/weather?prefecture=${encodeURIComponent(prefecture)}`);
      const data = await res.json();
      setWeather(data.weather ?? '');
    };
    loadWeather();
  }, [prefecture]);

  const sizeHint = useMemo(
    () => (size === 'L' ? 'A5印刷なら L がバランス良くておすすめ。' : '2L は文字を大きめに見せたい時におすすめ。'),
    [size]
  );

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(PROMPT_TEXT);
  };

  const updateFile = (targetFile: File | null) => {
    if (!targetFile) return;
    setFile(targetFile);
    setSplitPieces([]);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    updateFile(event.dataTransfer.files[0] ?? null);
  };

  const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    updateFile(event.target.files?.[0] ?? null);
  };

  const generatePreview = async () => {
    if (!file) return;
    setLoadingPreview(true);
    const form = new FormData();
    form.append('file', file);
    form.append('days', String(days));

    const res = await fetch('/api/split', { method: 'POST', body: form });
    const data = await res.json();
    setSplitPieces(data.pieces ?? []);
    setLoadingPreview(false);
  };

  const downloadPng = async () => {
    if (!file) return;
    setDownloading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('days', String(days));
    form.append('size', size);
    form.append('includeDate', includeDate);
    form.append('prefecture', prefecture);
    form.append('weather', weather);

    const res = await fetch('/api/render', { method: 'POST', body: form });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary-print-${size}-${days}days.png`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloading(false);
  };

  return (
    <main className={styles.main}>
      {showGuide && (
        <div className={styles.modalBackdrop}>
          <section className={styles.modal}>
            <button
              className={styles.closeButton}
              onClick={() => {
                localStorage.setItem('diary-guide-hidden', '1');
                setShowGuide(false);
              }}
            >
              ×
            </button>
            <h2>使い方</h2>
            <ol>
              <li>日記画像をアップロード</li>
              <li>日数と印刷設定を選択</li>
              <li>プレビュー確認後にPNGをダウンロード</li>
            </ol>
          </section>
        </div>
      )}

      <h1>Diary Print</h1>

      <section className={styles.card}>
        <h2>まずは画像を用意しよう</h2>
        <p className={styles.prompt}>{PROMPT_TEXT}</p>
        <button onClick={copyPrompt} className={styles.primaryBtn}>プロンプトをコピー</button>
      </section>

      <section className={styles.card}>
        <h2>画像アップロード</h2>
        <label className={styles.dropzone} onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
          <input type="file" accept="image/*" onChange={onFileInput} hidden />
          <p>ドラッグ&ドロップ / タップで画像を選択</p>
        </label>
        {previewUrl && <img src={previewUrl} alt="preview" className={styles.mainPreview} />}
      </section>

      <section className={styles.card}>
        <h2>設定</h2>
        <div className={styles.field}><span>日数</span><input type="range" min={1} max={7} value={days} onChange={(e) => setDays(Number(e.target.value))} /><strong>{days}日</strong></div>
        <div className={styles.field}><span>印刷</span><select value={printType} onChange={(e) => setPrintType(e.target.value as PrintType)}><option value="sticker">シール</option><option value="paper">紙</option></select></div>
        {printType === 'sticker' && (
          <div className={styles.field}><span>店舗</span><select value={store} onChange={(e) => setStore(e.target.value as StoreType)}><option value="familymart">ファミマ</option><option value="lawson">ローソン</option></select></div>
        )}
        <div className={styles.field}><span>サイズ</span><select value={size} onChange={(e) => setSize(e.target.value as SizeType)}><option value="L">L</option><option value="2L">2L</option></select></div>
        <small>{sizeHint}</small>
        <div className={styles.field}><span>日時入れる</span><select value={includeDate} onChange={(e) => setIncludeDate(e.target.value as 'yes' | 'no')}><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div className={styles.field}><span>都道府県</span><select value={prefecture} onChange={(e) => setPrefecture(e.target.value)}>{PREFECTURES.map((p) => <option value={p} key={p}>{p}</option>)}</select></div>
        <p>天気: {weather}</p>
      </section>

      <section className={styles.card}>
        <h2>プレビュー</h2>
        <button className={styles.primaryBtn} onClick={generatePreview} disabled={!file || loadingPreview}>{loadingPreview ? '生成中...' : 'プレビュー生成'}</button>
        <div className={styles.grid}>
          {splitPieces.map((piece) => <img key={piece.index} src={piece.dataUrl} alt={`day-${piece.index + 1}`} className={styles.tile} />)}
        </div>
      </section>

      <section className={styles.card}>
        <h2>ダウンロード</h2>
        <button className={styles.primaryBtn} onClick={downloadPng} disabled={!file || downloading}>{downloading ? '生成中...' : '印刷用PNGをダウンロード'}</button>
      </section>
    </main>
  );
}
