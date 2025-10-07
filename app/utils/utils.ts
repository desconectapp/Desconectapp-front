export const formatWeekTimeslots = (weekTimeslots: number[]) => {
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

    const selectedDays = weekTimeslots
      .map((timeslot) => {
        // Convert timeslot to day (each day has 48 half-hour timeslots)
        const day = Math.floor(timeslot / 48)
        if (day > 6 || day < 0) {
          return null
        }
        return days[day]
      })
      .filter(Boolean)

    return [...new Set(selectedDays)].join(", ")
  }