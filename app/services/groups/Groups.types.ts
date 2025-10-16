export interface Member {
  id: string
  uuid: string
  name: string
  avatar_url?: string
}

export interface GroupData {
  id: string
  name: string
  description: string
  created_at: string
  activity: string
  icon: string
  location: string
  public: boolean
  avatar_url: string | null
  members: Member[]
}

export interface CreateGroupParams {
  name: string | null;
  description: string | null;
  location: string | null;
  location_name: string | null;
  activity_id: number;
  public: boolean | false;
  week_timeslots: number[];
  user_ids: number[];
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
  avatar_url: string | null
}

export interface PaginatedUserGroups {
  groups: Group[]
  has_more: boolean
}

export interface OpenGroup {
  id:           number
	name:         string
	description:  string
	location:     string
  coords:        string // "latitude,longitude"
	activity_name: string
	member_count:	number
	photo:	string
  avatar_url: string | null
  week_timeslots?: number[]
}

export interface MapGroup {
  id: string
  name: string
  icon: string
  coordinates: [number, number] // [longitude, latitude]
  radius?: number // in km
  location: string
  description?: string
  membersCount?: number
  avatarUrl?: string
  week_timeslots?: number[]
}


export interface PaginatedOpenGroup {
  groups: OpenGroup[]
  has_more: boolean
}
