/**
 * India-First Date and Time Formatting Utilities
 * Standard: Default timezone Asia/Kolkata, formatted strictly as "Sat, 14 Sep · 7:00 PM IST"
 */

export function formatEventDateIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'Date TBD';
  
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Date TBD';

    // Formatter for "Sat, 14 Sep"
    const dayDateFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    // Formatter for "7:00 PM"
    const timeFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const dayDate = dayDateFormatter.format(date);
    const time = timeFormatter.format(date);

    return `${dayDate} · ${time} IST`;
  } catch (error) {
    console.error('Error formatting date in IST:', error);
    return 'Date TBD';
  }
}

export function formatEventTimeRangeIST(
  startInput: string | Date,
  endInput?: string | Date | null
): string {
  if (!startInput) return 'Date TBD';
  try {
    const startDate = typeof startInput === 'string' ? new Date(startInput) : startInput;
    if (isNaN(startDate.getTime())) return 'Date TBD';

    const dayDateFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    const timeFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const dayDate = dayDateFormatter.format(startDate);
    const startTime = timeFormatter.format(startDate);

    if (!endInput) {
      return `${dayDate} · ${startTime} IST`;
    }

    const endDate = typeof endInput === 'string' ? new Date(endInput) : endInput;
    if (isNaN(endDate.getTime())) {
      return `${dayDate} · ${startTime} IST`;
    }

    const endTime = timeFormatter.format(endDate);
    return `${dayDate} · ${startTime} – ${endTime} IST`;
  } catch {
    return 'Date TBD';
  }
}

export function extractCity(location?: string | null): string {
  if (!location) return 'Bengaluru';
  
  const knownCities = [
    'Mumbai',
    'Bengaluru',
    'Bangalore',
    'Delhi',
    'Delhi NCR',
    'Gurugram',
    'Gurgaon',
    'Noida',
    'Goa',
    'Hyderabad',
    'Pune',
    'Chennai',
    'Kolkata',
    'Jaipur',
    'Chandigarh',
    'Ahmedabad',
    'Kochi',
  ];

  for (const city of knownCities) {
    if (new RegExp(`\\b${city}\\b`, 'i').test(location)) {
      return city.toLowerCase() === 'bangalore' ? 'Bengaluru' : city;
    }
  }

  // If contains commas, take the last or second last segment
  const parts = location.split(',').map((p) => p.trim());
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }

  return location.slice(0, 20);
}

export function isUpcoming(dateInput: string | Date): boolean {
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.getTime() >= Date.now();
  } catch {
    return true;
  }
}
