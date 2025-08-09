
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTimeDetection } from '../../hooks/useTimeDetection';
import { supabase } from '@/integrations/supabase/client';

// Create proper mock implementation with chainable methods
const mockSupabaseFrom = vi.fn().mockReturnValue({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnValue({ data: [{ id: 'm1', content: 'msg' }] })
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockSupabaseFrom,
    functions: {
      invoke: vi.fn()
    },
    auth: {
      getUser: vi.fn(),
    },
  },
}));

vi.mock('../../hooks/useCalendarInvite', () => ({
  useCalendarInvite: () => ({ sendInvite: vi.fn(), isSending: false }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('useTimeDetection', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSupabaseFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnValue({ data: [{ id: 'm1', content: 'msg' }] })
    });
  });

  it('opens confirmation dialog when a time is detected', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: {
        detected: true,
        meetingTime: { detected_time: '2023-01-01T00:00:00Z' },
      },
      error: null
    });
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        detected: true,
        meetingTime: { detected_time: '2023-01-01T00:00:00Z' },
      }),
    }) as any;

    const { result } = renderHook(() =>
      useTimeDetection({ matchId: '1', onInviteSent: vi.fn() })
    );

    await act(async () => {
      await result.current.detectMeetingTime();
    });

    expect(result.current.isConfirmDialogOpen).toBe(true);
    expect(result.current.isDateDialogOpen).toBe(false);
    expect(result.current.detectedMeetingTime).toEqual(new Date('2023-01-01T00:00:00Z'));
  });

  it('opens date dialog when no time is detected', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ user: { id: '1' } });
    
    (supabase.functions.invoke as jest.Mock).mockResolvedValue({
      data: { detected: false },
      error: null
    });
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ detected: false }),
    }) as any;

    const { result } = renderHook(() =>
      useTimeDetection({ matchId: '1', onInviteSent: vi.fn() })
    );

    await act(async () => {
      await result.current.detectMeetingTime();
    });

    expect(result.current.isDateDialogOpen).toBe(true);
    expect(result.current.isConfirmDialogOpen).toBe(false);
  });
});
