import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Text } from "../Text"
import { useAppTheme } from "@/utils/useAppTheme"

export interface SchedulePreviewProps {
  weekTimeslots: number[]
}


const parseWeekTimeslots = (slots: number[]) => {
  const days = [
    { name: 'Lunes', code: 'L', start: 0 },      // Monday: slots 0-47
    { name: 'Martes', code: 'M', start: 48 },    // Tuesday: slots 48-95
    { name: 'Miércoles', code: 'X', start: 96 }, // Wednesday: slots 96-143
    { name: 'Jueves', code: 'J', start: 144 },   // Thursday: slots 144-191
    { name: 'Viernes', code: 'V', start: 192 },  // Friday: slots 192-239
    { name: 'Sábado', code: 'S', start: 240 },   // Saturday: slots 240-287
    { name: 'Domingo', code: 'D', start: 288 }   // Sunday: slots 288-335
  ];

  return days.map(day => {
    const dayEnd = day.start + 47; // 48 slots per day (0-47 for each day)
    const daySlots = slots.filter(slot => slot >= day.start && slot <= dayEnd).sort((a, b) => a - b);
    
    if (daySlots.length === 0) {
      return {
        dayCode: day.code,
        dayName: day.name,
        isAvailable: false,
        timeRanges: []
      };
    }

    // Group consecutive slots into time ranges
    const timeRanges: string[] = [];
    let rangeStart = daySlots[0];
    let rangeEnd = daySlots[0];

    for (let i = 1; i <= daySlots.length; i++) {
      if (i < daySlots.length && daySlots[i] === rangeEnd + 1) {
        rangeEnd = daySlots[i];
      } else {
        // Convert slot numbers to time strings
        const startTime = slotToTime(rangeStart);
        const endTime = slotToTime(rangeEnd + 1); // +1 because we want the end of the last slot
        timeRanges.push(`${startTime}-${endTime}`);
        
        if (i < daySlots.length) {
          rangeStart = daySlots[i];
          rangeEnd = daySlots[i];
        }
      }
    }

    return {
      dayCode: day.code,
      dayName: day.name,
      isAvailable: true,
      timeRanges
    };
  });
};

// Convert absolute slot number to time string (e.g., "14:30")
// slot 0 = Monday 00:00, slot 1 = Monday 00:30, slot 2 = Monday 01:00, etc.
const slotToTime = (slot: number): string => {
  const totalMinutes = slot * 30; // Each slot is 30 minutes
  const dayMinutes = totalMinutes % (24 * 60); // Minutes within the day
  const hours = Math.floor(dayMinutes / 60);
  const minutes = dayMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};


  // Convert time string to minutes (e.g., "14:30" -> 870)
  const timeStringToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }
export const SchedulePreview = observer(function SchedulePreview({ weekTimeslots }: SchedulePreviewProps) {
  const { themed, theme } = useAppTheme()
  const weekSchedule = parseWeekTimeslots(weekTimeslots);
  
  return (
    <View style={themed($scheduleSection)}>
      <Text style={themed($sectionLabel)}>Horarios Disponibles</Text>
      <View style={$weekScheduleContainer}>
        {weekSchedule.map((day) => (
          <View key={day.dayCode} style={$dayColumn}>
            <View style={themed($dayBar)}>
              {day.timeRanges &&
                day.timeRanges.length > 0 &&
                day.timeRanges.map((range, i) => {
                  const [start, end] = range.split("-")
                  const startMinutes = timeStringToMinutes(start)
                  const endMinutes = timeStringToMinutes(end)
                  const totalMinutes = 24 * 60

                  const topValue = (startMinutes / totalMinutes) * 140 // 140px bar height
                  const heightValue = ((endMinutes - startMinutes) / totalMinutes) * 140

                  console.log(
                    `Rendering segment ${i} for ${day.dayCode}: ${range}, top: ${topValue}, height: ${heightValue}`,
                  )

                  return (
                    <View
                      key={`${day.dayCode}-segment-${i}-${range}`}
                      style={[
                        themed($timeSegment),
                        {
                          top: Math.max(0, topValue),
                          height: Math.max(16, heightValue), // Altura mínima más grande
                        },
                      ]}
                    >
                      <View style={themed($segmentContent)}>
                        <Text style={themed($segmentTimeText)}>
                          {start.slice(0, 2)}h-{end.slice(0, 2)}h
                        </Text>
                      </View>
                    </View>
                  )
                })}
            </View>
            <Text style={themed($dayLabel)}>{day.dayCode}</Text>
          </View>
        ))}
      </View>
    </View>
  )
})

const $scheduleSection = {
  marginBottom: 20,
  padding: 16,
  backgroundColor: "$muted",
  borderRadius: 16,
} as const

const $sectionLabel = {
  fontSize: 12,
  fontWeight: "600",
  color: "$mutedForeground",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: 12,
} as const

const $weekScheduleContainer = {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "flex-end",
  marginLeft: -20, // Mover todo el contenedor hacia la izquierda
} as const

const $dayBar = {
  width: 40,
  height: 140, // Más altura para dar más espacio
  backgroundColor: "$background",
  borderWidth: 1,
  borderColor: "$border",
  position: "relative",
  borderRadius: 4,
  marginBottom: 8,
} as const

const $timeSegment = {
  backgroundColor: "$primary",
  position: "absolute",
  width: "100%",
  borderRadius: 3,
  justifyContent: "center",
  alignItems: "center",
  opacity: 0.9,
  borderWidth: 1,
  borderColor: "$primaryForeground",
  paddingVertical: 2, // Espacio interno vertical
} as const

const $segmentContent = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
} as const

const $segmentTimeText = {
  color: "$primaryForeground",
  fontSize: 10,
  fontWeight: "bold",
  textAlign: "center",
  lineHeight: 10,
} as const

const $dayLabel = {
  fontSize: 11,
  fontWeight: "600",
  color: "$mutedForeground",
  textAlign: "center",
} as const

const $dayColumn = {
  alignItems: "center",
  marginHorizontal: 2,
} as const
