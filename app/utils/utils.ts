export function emojiMapper(activity:string): string {
  const emojis: Record<string, string> = {
    "running": "🏃",
    "swimming": "🏊",
    "cycling": "🚴",
    "reading": "📚",
    "gaming": "🎮",
    "cooking": "🍳",
    "traveling": "✈️",
    "music": "🎵",
    "Fútbol": "⚽",
    "Caminata": "🚶",
    "Cine": "🎬",
  };

  return emojis[activity] || "";
}