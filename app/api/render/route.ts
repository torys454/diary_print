import { NextRequest, NextResponse } from 'next/server';
import { renderPrintPng, type PaperSize } from '@/lib/render';
import { splitImageByDays } from '@/lib/split';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');
  const days = Number(formData.get('days') ?? 1);
  const size = String(formData.get('size') ?? 'L') as PaperSize;
  const includeDate = String(formData.get('includeDate') ?? 'yes') === 'yes';
  const prefecture = String(formData.get('prefecture') ?? '');
  const weather = String(formData.get('weather') ?? '');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required' }, { status: 400 });
  }

  if (!Number.isInteger(days) || days < 1 || days > 7) {
    return NextResponse.json({ error: 'days must be between 1 and 7' }, { status: 400 });
  }

  if (size !== 'L' && size !== '2L') {
    return NextResponse.json({ error: 'size must be L or 2L' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const slices = await splitImageByDays(buffer, days);
  const png = await renderPrintPng(slices, size, days, includeDate, prefecture, weather);

  return new NextResponse(png, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="diary-print-${size}-${days}days.png"`
    }
  });
}
