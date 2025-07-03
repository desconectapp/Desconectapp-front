export interface Member {
  id: string
  name: string
  picture?: string
}

export interface GroupData {
  id: string
  name: string
  description: string
  created_at: string
  activity: string
  icon: string
  location: string
  members: Member[]
}

export interface Group {
  id: string
  name: string
  description: string
  created_at: string
  activity: string
  icon: string
  location: string
  members_count: number
}
