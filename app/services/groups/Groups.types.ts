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
  public: boolean
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

export interface OpenGroup {
  id:           number
	name:         string
	description:  string
	location:     string
	activity_name: string
	member_count:	number
	photo:	string
}

export interface PaginatedOpenGroup {
  groups: OpenGroup[]
  has_more: boolean
}