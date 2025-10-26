import { Activity } from "@/services/activities"
import { ActivitySearchRequest } from "@/services/search/Search.types"
import { types } from "mobx-state-tree"

export interface LocationData {
  id: string
  name: string
  latitude: number
  longitude: number
  address: string
}

export interface TimeRange {
  start: string
  end: string
}

export interface TimeSlot {
  start: number
  end: number
}

export interface DaySchedule {
  day: string
  timeSlots: TimeRange[]
}

export interface ScheduleData {
  [day: string]: TimeRange[]
}

// Backend expected format
export interface Schedules {
  [day: string]: TimeSlot[]
}

// Helper function to convert time string (HH:MM) to minutes from midnight
const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

// Map Spanish day names to English lowercase
const dayTranslation: { [key: string]: string } = {
  'Lunes': 'monday',
  'Martes': 'tuesday',
  'Miércoles': 'wednesday',
  'Jueves': 'thursday',
  'Viernes': 'friday',
  'Sábado': 'saturday',
  'Domingo': 'sunday'
}

// export interface RequestData {
//   activities: string[]
//   minPeople: number | null
//   maxPeople: number | null
//   lon: number | null
//   lat: number | null
//   radiusKm: number | null
//   schedules: DaySchedule[] | null
// }


export const LocationModel = types.model("LocationModel", {
  id: types.string,
  name: types.string,
  latitude: types.number,
  longitude: types.number,
  address: types.string,
})

const TimeRangeModel = types.model("TimeRange", {
  start: types.string,
  end: types.string,
})

const DayScheduleModel = types.model("DaySchedule", {
  day: types.string,
  timeSlots: types.array(TimeRangeModel),
})

const ActivityModel = types.model("ActivityModel", {
  id: types.number,
  name: types.string,
})

export const RequestStoreModel = types
  .model("RequestStoreModel", {
    user_id: types.number,
    activity: types.maybeNull(ActivityModel),
    location: types.maybeNull(LocationModel),
    schedules: types.array(DayScheduleModel),
    radiusKm: types.optional(types.number, 5), // Default 5km radius
    minParticipants: types.optional(types.number, 2), // Default 2 minimum participants
    maxParticipants: types.optional(types.number, 5), // Default 5 maximum participants
  })
  .actions((store) => ({

    setUserId(userId: number) {
      store.user_id = userId
    },

    setActivity(activity: Activity | null) {
      store.activity = activity
    },

    setLocation(location: LocationData | null) {
      if (location) {
        store.location = {
          id: location.id,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
        }
      } else {
        store.location = null
      }
    },
    setSchedules(schedules: DaySchedule[]) {
      const convertedSchedules = schedules.map(schedule => 
        DayScheduleModel.create({
          day: schedule.day,
          timeSlots: schedule.timeSlots.map(timeSlot => 
            TimeRangeModel.create({
              start: timeSlot.start,
              end: timeSlot.end,
            })
          ),
        })
      )
      store.schedules.replace(convertedSchedules)
    },
    setRadiusKm(radius: number) {
      store.radiusKm = radius
    },
    setMinParticipants(min: number) {
      store.minParticipants = min
    },
    setMaxParticipants(max: number) {
      store.maxParticipants = max
    },
    setScheduleForDay(day: string, timeSlots: TimeRange[]) {
      const existingIndex = store.schedules.findIndex(s => s.day === day)
      const newSchedule = DayScheduleModel.create({
        day,
        timeSlots: timeSlots.map(slot => 
          TimeRangeModel.create({ start: slot.start, end: slot.end })
        ),
      })
      
      if (existingIndex >= 0) {
        store.schedules.splice(existingIndex, 1, newSchedule)
      } else {
        store.schedules.push(newSchedule)
      }
    },
    clearRequest() {
      store.activity = null
      store.radiusKm = 5 // Reset to default
      store.minParticipants = 2 // Reset to default
      store.maxParticipants = 5 // Reset to default
      store.location = null
      store.schedules.clear()
    },

 

    getRequestData(): ActivitySearchRequest {
      
      const timeslots = convertScheduleToTimeSlot()

      return {
        user_id: store.user_id,
        description: store.activity ? store.activity.name : "No description",
        activity_id: store.activity ? store.activity.id : 0,
        participants_needed: store.minParticipants,
        max_participants: store.maxParticipants,
        longitude: store.location ? store.location.longitude : 0,
        latitude: store.location ? store.location.latitude : 0,
        search_radius: store.radiusKm,
        timeslots: timeslots,
      }
    },
  }))

  .views((store) => ({
    get isActivitySelected() {
      return store.activity !== null
    },
    get isLocationSelected() {
      return store.location !== null
    },
    get isScheduleSelected() {
      return store.schedules.length > 0
    },
    get isRequestComplete() {
      return this.isActivitySelected && this.isLocationSelected && this.isScheduleSelected
    },
  }))


export function convertScheduleToTimeSlot(schedules?: DaySchedule[]): number[] {
      // Convert schedules to half-hour timeslots
      const timeslots : number[] = [];

      (schedules || []).forEach((daySchedule: DaySchedule) => {
        // Translate Spanish day name to English lowercase
        const englishDay = dayTranslation[daySchedule.day] || daySchedule.day.toLowerCase()
        
        // Get day offset (Monday = 0, Tuesday = 48, Wednesday = 96, etc.)
        const dayOffsets: { [key: string]: number } = {
          'monday': 0,
          'tuesday': 48,
          'wednesday': 96,
          'thursday': 144,
          'friday': 192,
          'saturday': 240,
          'sunday': 288
        }
        
        const dayOffset = dayOffsets[englishDay] || 0

        daySchedule.timeSlots.forEach((timeSlot: TimeRange) => {
          const startMinutes = timeStringToMinutes(timeSlot.start)
          const endMinutes = timeStringToMinutes(timeSlot.end)
          
          // Convert to half-hour timeslots
          // Each hour has 2 timeslots (0-30min and 30-60min)
          const startTimeslot = Math.floor(startMinutes / 30) + 1
          const endTimeslot = Math.floor(endMinutes / 30)
          
          for (let i = startTimeslot; i <= endTimeslot; i++) {
            timeslots.push(dayOffset + i)
          }
        })
      })
      return timeslots    
}

