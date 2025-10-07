export interface GroupFront {
  id: number
  name: string
  lastMessage?: string
  icon?: string
  memberCount?: number
  activity?: string
  unreadCount?: number
  description?: string
  location?: string
  avatar_url?: string | null
}
