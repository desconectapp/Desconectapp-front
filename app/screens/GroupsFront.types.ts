export interface GroupFront {
  id: number
  name: string
  lastMessage?: string
  icon?: string
  memberCount?: number
  activity?: string
  unreadCount?: number
}