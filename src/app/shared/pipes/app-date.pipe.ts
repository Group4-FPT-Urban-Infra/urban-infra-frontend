import { Pipe, PipeTransform } from '@angular/core'
import {
  parseUtcDate,
  formatTimeAgo,
  formatLocalDate,
  formatLocalDateTime,
  formatLocalTime,
  isValidDate,
} from '../../core/utils/date.utils'

@Pipe({
  name: 'appDate',
  standalone: true,
})
export class AppDatePipe implements PipeTransform {
  transform(
    value: Date | string | number | null | undefined,
    format: 'short' | 'medium' | 'long' | 'date' | 'time' | 'dateTime' = 'short',
    locale = 'vi-VN',
  ): string {
    if (value === null || value === undefined || value === '') return ''
    const d = parseUtcDate(value)
    if (!isValidDate(d)) return ''

    switch (format) {
      case 'date':
        return formatLocalDate(d, locale)
      case 'time':
        return formatLocalTime(d, locale)
      case 'dateTime':
        return formatLocalDateTime(d, locale)
      case 'short':
        return d.toLocaleDateString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      case 'medium':
        return d.toLocaleDateString(locale, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      case 'long':
        return d.toLocaleDateString(locale, {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      default:
        return formatLocalDateTime(d, locale)
    }
  }
}

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    return formatTimeAgo(value)
  }
}
