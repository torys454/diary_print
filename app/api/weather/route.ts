import { NextRequest, NextResponse } from 'next/server';
import { getWeatherByPrefecture } from '@/lib/weather';

export async function GET(request: NextRequest) {
  const prefecture = request.nextUrl.searchParams.get('prefecture');
  if (!prefecture) {
    return NextResponse.json({ error: 'prefecture is required' }, { status: 400 });
  }

  return NextResponse.json({ prefecture, weather: getWeatherByPrefecture(prefecture) });
}
