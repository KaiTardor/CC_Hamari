import { describe, it, expect } from 'vitest'
import { toDDMMYYYY } from '../date'

describe('date utilities', () => {
  describe('toDDMMYYYY', () => {
    it('converts ISO date to DD/MM/YYYY format', () => {
      const isoDate = '2025-10-25'
      const formatted = toDDMMYYYY(isoDate)
      expect(formatted).toBe('25/10/2025')
    })

    it('handles date with single digit day and month', () => {
      const isoDate = '2025-01-05'
      const formatted = toDDMMYYYY(isoDate)
      expect(formatted).toBe('05/01/2025')
    })

    it('returns empty string for empty input', () => {
      const result = toDDMMYYYY('')
      expect(result).toBe('')
    })

    it('handles edge case dates', () => {
      expect(toDDMMYYYY('2025-12-31')).toBe('31/12/2025')
      expect(toDDMMYYYY('2025-01-01')).toBe('01/01/2025')
    })
  })
})
