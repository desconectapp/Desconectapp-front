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

export interface DaySchedule {
  day: string
  timeSlots: TimeRange[]
}

export interface ScheduleData {
  [day: string]: TimeRange[]
}

export interface RequestData {
  activities: string[]
  location: LocationData | null
  schedules: DaySchedule[]
}

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

export const RequestStoreModel = types
  .model("RequestStoreModel", {
    activities: types.array(types.string),
    location: types.maybeNull(LocationModel),
    schedules: types.array(DayScheduleModel),
  })
  .actions((store) => ({
    setActivities(activities: string[]) {
      store.activities.replace(activities)
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
      store.activities.clear()
      store.location = null
      store.schedules.clear()
    },
    getRequestData(): RequestData {
      return {
        activities: store.activities.slice(),
        location: store.location ? {
          id: store.location.id,
          name: store.location.name,
          latitude: store.location.latitude,
          longitude: store.location.longitude,
          address: store.location.address,
        } : null,
        schedules: store.schedules.map(schedule => ({
          day: schedule.day,
          timeSlots: schedule.timeSlots.map(slot => ({
            start: slot.start,
            end: slot.end,
          })),
        })),
      }
    },
  }))
  .views((store) => ({
    get isActivitySelected() {
      return store.activities.length > 0
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
