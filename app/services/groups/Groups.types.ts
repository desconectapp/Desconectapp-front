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
  members: Member[]
}

export interface CreateGroupParams {
  name: string | null;
  description: string | null;
  location: string | null;
  activity_id: number;
  public: boolean | false;
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
