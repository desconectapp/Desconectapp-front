import { DaySchedule } from "@/models";


export interface SearchRequest {
  activity: string;
  minPeople: number;
  maxPeople: number;
  lon: number;
  lat: number;
  radiusKm: number;
  schedules: DaySchedule[]
}

export interface ActivitySearchRequest {
  user_id: number;
  activity_id: number;
  description: string;
  longitude: number;
  latitude: number;
  search_radius: number;
  max_participants: number;
  participants_needed: number;
  schedules: BackendSchedules;
}

export type TimeSlot = {
  start: number;
  end: number;
};
export interface BackendSchedules {
  [day: string]: TimeSlot[];
};
