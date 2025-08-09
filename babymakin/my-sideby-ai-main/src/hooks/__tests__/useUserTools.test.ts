
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useUserTools } from '../useUserTools';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis()
  }
}));

describe('useUserTools hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return empty array and loading state when no userId provided', async () => {
    // Mock select to return a promise that resolves to an object with data property
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => Promise.resolve({
        data: [],
        error: null
      }))
    }));

    const { result } = renderHook(() => useUserTools(undefined));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.userTools).toEqual([]);

    // Verify that supabase.from was never called
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should fetch user tools when userId is provided', async () => {
    const mockTools = [
      { id: '1', name: 'Tool 1', description: 'Description 1', url: 'https://example.com/tool1' },
      { id: '2', name: 'Tool 2', description: 'Description 2', url: 'https://example.com/tool2' }
    ];

    // Mock the Supabase response
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => Promise.resolve({
        data: mockTools,
        error: null
      }))
    }));

    const { result } = renderHook(() => useUserTools('user-123'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.userTools).toEqual([]);

    // Wait for the state update after the fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check if the data is correctly set
    expect(result.current.userTools).toEqual(mockTools);

    // Verify that supabase was called with the correct parameters
    expect(supabase.from).toHaveBeenCalledWith('user_tools');
  });

  it('should handle error when fetching tools fails', async () => {
    // Mock the Supabase response with an error
    (supabase.from as any).mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockImplementation(() => Promise.resolve({
        data: null,
        error: { message: 'Failed to fetch tools' }
      }))
    }));

    const { result } = renderHook(() => useUserTools('user-123'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the state update after the fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check if the error state is correctly set
    expect(result.current.userTools).toEqual([]);
    expect(result.current.error).toBeDefined();
  });
});
