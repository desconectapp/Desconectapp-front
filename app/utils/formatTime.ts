export function formatDateGroupCard(sentAt: string): string {
  const date = new Date(sentAt)
  const now = new Date()

  function stripTime(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  const today = stripTime(now)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const lastWeek = new Date(today)
  lastWeek.setDate(today.getDate() - 7)

  const target = stripTime(date)

  if (target.getTime() === today.getTime()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (target.getTime() === yesterday.getTime()) {
    return "ayer"
  }

  if (target >= lastWeek) {
    return date.toLocaleDateString(undefined, { weekday: "long" })
  }

  return date.toLocaleDateString("es-ES")
}
