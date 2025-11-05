import { describe, it, expect } from 'vitest'
import { api } from './api'
import type { Offer, Booking } from './api'

describe('API configuration', () => {
  it('api instance is properly configured', () => {
    expect(api).toBeDefined()
    expect(api.defaults.baseURL).toContain('/api')
  })

  it('has correct default headers', () => {
    expect(api.defaults.headers['Content-Type']).toBe('application/json')
  })
})

describe('API types', () => {
  it('Offer type has required fields', () => {
    const mockOffer: Offer = {
      _id: '123',
      provider_dni: '12345678A',
      title: 'Test',
      description: 'Test description',
      price: 100,
      available_from: '01/10/2025',
      available_to: '31/10/2025',
      daily_capacity: 5,
      is_active: true,
    }
    
    expect(mockOffer._id).toBe('123')
    expect(mockOffer.price).toBe(100)
  })

  it('Booking type has required fields', () => {
    const mockBooking: Booking = {
      _id: '456',
      offer_id: '123',
      client_dni: '87654321B',
      date: '15/10/2025',
      status: 'PENDING',
    }
    
    expect(mockBooking.status).toBe('PENDING')
    expect(mockBooking.client_dni).toBe('87654321B')
  })
})
