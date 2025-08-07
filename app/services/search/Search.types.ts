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