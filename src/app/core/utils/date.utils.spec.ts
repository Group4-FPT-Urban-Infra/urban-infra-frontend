import { describe, it, expect } from 'vitest'
import {
  parseUtcDate,
  formatTimeAgo,
  formatLocalDate,
  formatLocalDateTime,
  formatLocalTime,
  getSlaCountdownInfo,
  isValidDate,
} from './date.utils'

describe('date.utils', () => {
  describe('parseUtcDate', () => {
    it('appends Z to ISO string lacking timezone', () => {
      const d = parseUtcDate('2026-08-20T02:45:00')
      expect(isValidDate(d)).toBe(true)
      expect(d.toISOString()).toBe('2026-08-20T02:45:00.000Z')
    })

    it('keeps existing Z in ISO string', () => {
      const d = parseUtcDate('2026-08-20T02:45:00Z')
      expect(isValidDate(d)).toBe(true)
      expect(d.toISOString()).toBe('2026-08-20T02:45:00.000Z')
    })

    it('handles space separated dates and times', () => {
      const d = parseUtcDate('2026-08-20 02:45:00')
      expect(isValidDate(d)).toBe(true)
      expect(d.toISOString()).toBe('2026-08-20T02:45:00.000Z')
    })

    it('returns invalid Date for null/undefined/empty', () => {
      expect(isValidDate(parseUtcDate(null))).toBe(false)
      expect(isValidDate(parseUtcDate(undefined))).toBe(false)
      expect(isValidDate(parseUtcDate(''))).toBe(false)
    })
  })

  describe('formatTimeAgo', () => {
    it('returns Just now for recent timestamps', () => {
      const now = new Date()
      expect(formatTimeAgo(now.toISOString())).toBe('Just now')
    })

    it('handles ISO string without Z correctly as UTC', () => {
      const fiveMinsAgoUtc = new Date(Date.now() - 5 * 60 * 1000).toISOString().replace('Z', '')
      expect(formatTimeAgo(fiveMinsAgoUtc)).toBe('5 min ago')
    })
  })

  describe('getSlaCountdownInfo', () => {
    it('calculates remaining SLA time', () => {
      const futureDue = new Date(Date.now() + 45 * 60 * 1000).toISOString()
      const info = getSlaCountdownInfo(futureDue)
      expect(info.isBreached).toBe(false)
      expect(info.text).toContain('left')
    })

    it('detects breached SLA', () => {
      const pastDue = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      const info = getSlaCountdownInfo(pastDue)
      expect(info.isBreached).toBe(true)
      expect(info.text).toContain('overdue')
    })
  })
})
