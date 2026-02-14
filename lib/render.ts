import sharp from 'sharp';

export type PaperSize = 'L' | '2L';

const CANVAS_SIZE: Record<PaperSize, { width: number; height: number }> = {
  L: { width: 1051, height: 1500 },
  '2L': { width: 1500, height: 2102 }
};

export async function renderPrintPng(
  slices: Buffer[],
  size: PaperSize,
  days: number,
  includeDate: boolean,
  placeName?: string,
  weatherText?: string
): Promise<Buffer> {
  const canvas = CANVAS_SIZE[size];
  const columns = days <= 3 ? days : Math.ceil(days / 2);
  const rows = days <= 3 ? 1 : 2;
  const gap = 20;
  const innerX = 36;
  const innerY = includeDate ? 90 : 36;
  const tileW = Math.floor((canvas.width - innerX * 2 - gap * (columns - 1)) / columns);
  const tileH = Math.floor((canvas.height - innerY - 36 - gap * (rows - 1)) / rows);

  const composite: sharp.OverlayOptions[] = [];
  for (let i = 0; i < slices.length; i += 1) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const left = innerX + col * (tileW + gap);
    const top = innerY + row * (tileH + gap);
    const resized = await sharp(slices[i]).resize(tileW, tileH, { fit: 'cover' }).png().toBuffer();
    composite.push({ input: resized, left, top });
  }

  const header = includeDate
    ? `<svg width="${canvas.width}" height="80"><style>text{font-family:Arial,sans-serif;fill:#2a2f3a}</style><text x="36" y="32" font-size="28">${new Date().toLocaleDateString('ja-JP')}</text><text x="36" y="64" font-size="20">${placeName ? `${placeName} / ` : ''}${weatherText ?? ''}</text></svg>`
    : undefined;

  const base = sharp({
    create: {
      width: canvas.width,
      height: canvas.height,
      channels: 3,
      background: '#ffffff'
    }
  });

  if (header) {
    composite.unshift({ input: Buffer.from(header), left: 0, top: 8 });
  }

  return base.composite(composite).png().toBuffer();
}
