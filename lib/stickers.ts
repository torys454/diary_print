export type Sticker = {
  id: string;
  label: string;
  preview: string;
};

const LABELS = ["Mood", "Highlight", "Note"] as const;

export function buildPreviewStickers(text: string): Sticker[] {
  const safeText = text.trim() || "日記の内容をここに入力";

  return LABELS.map((label, index) => ({
    id: `${label.toLowerCase()}-${index}`,
    label,
    preview: `${safeText} #${index + 1}`,
  }));
}
