# RequestStore Usage Guide

The RequestStore has been successfully updated with a proper schedule data structure. Here's how it works:

## RequestStore Features

### Data Structure
- **activities**: Array of strings representing selected activities
- **location**: Location object with id, name, latitude, longitude, and address  
- **schedules**: Array of DaySchedule objects with day and timeSlots

### Schedule Data Structure
```typescript
interface TimeRange {
  start: string  // e.g., "09:00"
  end: string    // e.g., "18:00"
}

interface DaySchedule {
  day: string           // e.g., "Monday", "Tuesday", etc.
  timeSlots: TimeRange[] // Array of time ranges for that day
}
```

### Actions
- `setActivities(activities: string[])` - Save selected activities
- `setLocation(location: LocationData | null)` - Save selected location  
- `setSchedules(schedules: DaySchedule[])` - Save complete schedule array
- `setScheduleForDay(day: string, timeSlots: TimeRange[])` - Set schedule for specific day
- `clearRequest()` - Clear all request data
- `getRequestData()` - Get complete request data object

### Views (Computed Properties)
- `isActivitySelected` - Returns true if activities are selected
- `isLocationSelected` - Returns true if location is selected
- `isScheduleSelected` - Returns true if schedules are selected
- `isRequestComplete` - Returns true if all three sections are complete

## Integration in Screens

### ActivityPickerScreen
- Loads previous selections from store on mount
- Updates store when activities are selected
- Automatically saves to store before navigation

### LocationPickerScreen  
- Loads previous location from store on mount
- Updates store immediately when location is selected or changed
- Restores map position based on stored location

### SchedulePickerScreen
- Loads previous schedules from store on mount
- Currently simplified to work with days of the week
- Converts selected days to DaySchedule format with default time slots
- Can be extended to support multiple time slots per day

## Usage Examples

### Basic Usage
```typescript
import { useStores } from "@/models"

function SomeComponent() {
  const { requestStore } = useStores()
  
  // Check if request is complete
  if (requestStore.isRequestComplete) {
    const requestData = requestStore.getRequestData()
    console.log("Complete request:", requestData)
  }
}
```

### Working with Schedules
```typescript
// Set schedule for a specific day
requestStore.setScheduleForDay("Monday", [
  { start: "09:00", end: "12:00" },
  { start: "14:00", end: "18:00" }
])

// Set multiple days at once
const schedules = [
  {
    day: "Monday", 
    timeSlots: [{ start: "09:00", end: "18:00" }]
  },
  {
    day: "Wednesday",
    timeSlots: [
      { start: "09:00", end: "12:00" },
      { start: "14:00", end: "17:00" }
    ]
  }
]
requestStore.setSchedules(schedules)

// Access schedule data
console.log("All schedules:", requestStore.schedules)
requestStore.schedules.forEach(daySchedule => {
  console.log(`${daySchedule.day}:`, daySchedule.timeSlots)
})
```

## Store Persistence

The RequestStore is integrated into the RootStore and will automatically persist data using the same mechanism as SessionStore and SignUpStore, ensuring data survives app restarts.

## Next Steps

- Enhance SchedulePickerScreen UI to support multiple time slots per day
- Add time picker components for start/end times
- Add validation for schedule conflicts
- Add more sophisticated computed properties for business logic
- Consider adding loading states for async operations
