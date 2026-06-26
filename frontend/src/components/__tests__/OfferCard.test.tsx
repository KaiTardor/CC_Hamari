import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OfferCard from '../OfferCard'
import type { Offer } from '../../api'

describe('OfferCard', () => {
  const mockOffer: Offer = {
    _id: '507f1f77bcf86cd799439011',
    provider_dni: '12345678A',
    title: 'Test Offer',
    description: 'Test Description',
    price: 100,
    people_included: 2,
    available_from: '01/10/2025',
    available_to: '31/10/2025',
    daily_capacity: 5,
    is_active: true,
  }

  it('renders offer title', () => {
    render(<OfferCard offer={mockOffer} />)
    expect(screen.getByText('Test Offer')).toBeInTheDocument()
  })

  it('renders offer description', () => {
    render(<OfferCard offer={mockOffer} />)
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('displays price formatted correctly', () => {
    render(<OfferCard offer={mockOffer} />)
    expect(screen.getByText(/100\.00/)).toBeInTheDocument()
  })

  it('displays availability window', () => {
    render(<OfferCard offer={mockOffer} />)
    expect(screen.getByText(/01\/10\/2025 → 31\/10\/2025/)).toBeInTheDocument()
  })

  it('displays daily capacity', () => {
    render(<OfferCard offer={mockOffer} />)
    expect(screen.getByText(/Cap:\s*5/)).toBeInTheDocument();
  })
})
