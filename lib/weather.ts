const WEATHER_MAP: Record<string, string> = {
  北海道: 'くもり',
  東京都: '晴れ',
  神奈川県: '晴れ時々くもり',
  愛知県: 'くもり時々雨',
  大阪府: '晴れ',
  福岡県: '晴れのち雨',
  沖縄県: '晴れ'
};

export function getWeatherByPrefecture(prefecture: string): string {
  return WEATHER_MAP[prefecture] ?? '天気情報なし';
}
