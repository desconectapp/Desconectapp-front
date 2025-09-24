export interface Member {
  id: string
  uuid: string
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
  status: boolean
  members: Member[]
}

export interface Group {
  id: number
  name: string
  description: string
  created_at: string
  activity: string
  icon: string
  location: string
  members_count: number
}

export interface PaginatedUserGroups {
  groups: Group[]
  has_more: boolean
}