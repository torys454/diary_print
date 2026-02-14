import sharp from 'sharp';

export type SplitPiece = { index: number; dataUrl: string };

export async function splitImageByDays(fileBuffer: Buffer, days: number): Promise<Buffer[]> {
  const image = sharp(fileBuffer).rotate();
  const metadata = await image.metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  if (!width || !height) {
    throw new Error('画像サイズを取得できませんでした。');
  }

  const pieceWidth = Math.floor(width / days);
  const pieces: Buffer[] = [];

  for (let i = 0; i < days; i += 1) {
    const left = i * pieceWidth;
    const extractWidth = i === days - 1 ? width - left : pieceWidth;
    const piece = await image
      .clone()
      .extract({ left, top: 0, width: extractWidth, height })
      .png()
      .toBuffer();
    pieces.push(piece);
  }

  return pieces;
}

export function toDataUrl(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString('base64')}`;
}
