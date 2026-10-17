import type { Category, CategoryId } from "./types";

export const CATEGORIES: Category[] = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "food", label: "Food", emoji: "🍲" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "outdoors", label: "Outdoors", emoji: "🏞️" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "arts", label: "Arts", emoji: "🎨" },
  { id: "music", label: "Music", emoji: "🎧" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "nightlife", label: "Hangout", emoji: "🌙" },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
);

export function categoryEmoji(id: CategoryId): string {
  return CATEGORY_MAP[id]?.emoji ?? "✨";
}

export function categoryLabel(id: CategoryId): string {
  return CATEGORY_MAP[id]?.label ?? "Other";
}

export function formatNaira(n: number): string {
  return n === 0 ? "Free" : "₦" + n.toLocaleString();
}
