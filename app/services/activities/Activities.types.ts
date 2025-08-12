export interface Activity {
  id: string
  name: string
  emoji: string
}

export interface ActivityRequest {
  id: string
  user_id: string
  activity_id: string
  description: string
  week_hours: number[]
  participants_needed: number
  maximum_participants: number
  latitude: number
  longitude: number
  search_radius: number
  created_at: string
  expires_at: string
}
