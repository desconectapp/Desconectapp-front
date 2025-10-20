export interface GroupFront {
  id: number
  name: string
  icon?: string
  memberCount?: number
  activity?: string
  unreadCount?: number
  description?: string
  location?: string
  avatar_url?: string | null
  lastMessage: LastMessageFront | undefined
  notSeen: boolean | undefined
  members: MembersFront[]
}

type LastMessageFront = {
  content: string
  group_id: number
  id: number
  image_url: string | null
  sent_at: string
  user_id: string
}

type MembersFront = {
  uuid: string
  name: string
}
