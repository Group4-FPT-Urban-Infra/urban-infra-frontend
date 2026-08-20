/**
 * Utility functions for handling and displaying UTC date/time strings returned from backend API.
 * Ensures all UTC timestamps are correctly interpreted as UTC and displayed in user's local timezone.
 */

/**
 * Safely parse a date value from backend (ISO string, UTC string, or Date) into a proper Date object.
 * If backend sends a timestamp without timezone suffix (e.g. "2026-08-20T02:45:00"),
 * this function treats it as UTC (appends 'Z') rather than interpreting it as browser local time.
 */
export function parseUtcDate(value: Date | string | number | null | undefined): Date {
  if (value === null || value === undefined || value === '') {
    return new Date(NaN)
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? new Date(NaN) : value
  }
  if (typeof value === 'number') {
    return new Date(value)
  }

  let str = String(value).trim()
  if (!str) {
    return new Date(NaN)
  }

  // If already standard ISO or date string
  if (str.includes('T') || str.includes(' ') || (str.includes('-') && str.length >= 10)) {
    // Normalise spaces to 'T' for ISO compliance
    str = str.replace(' ', 'T')
    // Check if timezone offset or 'Z' is present
    const hasTimezone = str.endsWith('Z') || str.endsWith('z') || /[+-]\d{2}(:\d{2})?$/.test(str)
    if (!hasTimezone) {
      str = str + 'Z'
    }
  }

  return new Date(str)
}

/**
 * Checks if a parsed date is valid.
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Returns human-readable relative time (e.g. "Just now", "5 min ago", "2 hr ago", "3 days ago")
 * or formatted date for older timestamps.
 */
export function formatTimeAgo(value: Date | string | number | null | undefined): string {
  const d = parseUtcDate(value)
  if (!isValidDate(d)) return ''

  const now = new Date()
  const diffMs = now.getTime() - d.getTime()

  // Future timestamp or very recent
  if (diffMs < 0 && Math.abs(diffMs) < 60000) {
    return 'Just now'
  }
  if (diffMs < 60000) {
    return 'Just now'
  }

  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `${diffMins} min ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hr ago`
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return formatLocalDate(d)
}

/**
 * Formats a UTC date/time in local date format (e.g. "20/08/2026" or "Aug 20, 2026").
 */
export function formatLocalDate(
  value: Date | string | number | null | undefined,
  locale = 'vi-VN',
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = parseUtcDate(value)
  if (!isValidDate(d)) return ''

  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
  return d.toLocaleDateString(locale, defaultOptions)
}

/**
 * Formats a UTC date/time in local date & time format (e.g. "20/08/2026 09:45" or "Aug 20, 2026, 09:45 AM").
 */
export function formatLocalDateTime(
  value: Date | string | number | null | undefined,
  locale = 'vi-VN',
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = parseUtcDate(value)
  if (!isValidDate(d)) return ''

  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return d.toLocaleString(locale, defaultOptions)
}

/**
 * Formats a UTC date/time in local time format (e.g. "09:45" or "09:45 AM").
 */
export function formatLocalTime(
  value: Date | string | number | null | undefined,
  locale = 'vi-VN',
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = parseUtcDate(value)
  if (!isValidDate(d)) return ''

  const defaultOptions: Intl.DateTimeFormatOptions = options ?? {
    hour: '2-digit',
    minute: '2-digit',
  }
  return d.toLocaleTimeString(locale, defaultOptions)
}

/**
 * Calculate SLA Countdown text and status (e.g. "45m left", "Breached 15m ago").
 */
export function getSlaCountdownInfo(dueAt: Date | string | null | undefined): {
  text: string
  isBreached: boolean
  isUrgent: boolean
} {
  const due = parseUtcDate(dueAt)
  if (!isValidDate(due)) {
    return { text: 'N/A', isBreached: false, isUrgent: false }
  }

  const now = new Date()
  const diffMs = due.getTime() - now.getTime()

  if (diffMs <= 0) {
    const overdueMins = Math.floor(Math.abs(diffMs) / 60000)
    const overdueHours = Math.floor(overdueMins / 60)
    const text = overdueHours > 0 ? `${overdueHours}h ${overdueMins % 60}m overdue` : `${overdueMins}m overdue`
    return { text, isBreached: true, isUrgent: true }
  }

  const minsLeft = Math.floor(diffMs / 60000)
  const hoursLeft = Math.floor(minsLeft / 60)
  const daysLeft = Math.floor(hoursLeft / 24)

  let text = ''
  if (daysLeft > 0) {
    text = `${daysLeft}d ${hoursLeft % 24}h left`
  } else if (hoursLeft > 0) {
    text = `${hoursLeft}h ${minsLeft % 60}m left`
  } else {
    text = `${minsLeft}m left`
  }

  return {
    text,
    isBreached: false,
    isUrgent: minsLeft <= 60, // Urgent if <= 1 hour left
  }
}
