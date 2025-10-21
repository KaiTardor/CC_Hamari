import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock axios
vi.mock('../../api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Test component to use the hook
function TestComponent() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div data-testid="loading">Loading...</div>
  }
  
  return (
    <div>
      <div data-testid="auth-status">{user ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-data">{user ? user.username : 'No User'}</div>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('provides authentication context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('auth-status')).toBeInTheDocument()
  })

  it('starts with no authenticated user when no token in localStorage', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated')
    expect(screen.getByTestId('user-data')).toHaveTextContent('No User')
  })
})
