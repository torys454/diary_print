import { NextRequest, NextResponse } from 'next/server';
import { splitImageByDays, toDataUrl } from '@/lib/split';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');
  const daysRaw = formData.get('days');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  const days = Number(daysRaw ?? 1);
  if (!Number.isInteger(days) || days < 1 || days > 7) {
    return NextResponse.json({ error: 'days must be between 1 and 7' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const pieces = await splitImageByDays(buffer, days);

  return NextResponse.json({
    pieces: pieces.map((piece, index) => ({ index, dataUrl: toDataUrl(piece) }))
  });
}
