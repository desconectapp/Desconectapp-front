export interface Member {
  id: string
  uuid: string
  name: string
  avatar_url?: string
  is_admin: boolean
}

export interface CommunityData {
  id: string
  name: string
  description: string
  created_at: string
  activity: string
  icon: string
  location: string
  avatar_url: string | null
  members: Member[]
}

export interface Community {
  id: string
  name: string
  description: string
  created_at: string
  activity: string
  icon: string
  location: string
  avatar_url: string | null
  members_count: number
}

export interface CreateCommunityParams {
  name: string | null
  location: string | null
  location_name: string | null
  activity_id: number | null
  week_timeslots: number[]
  description: string | null
  user_ids: number[]
}

export interface PaginatedCommunity {
  community: Community[]
  has_more: boolean
}