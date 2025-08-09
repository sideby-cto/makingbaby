import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCalendarInvite } from '../../hooks/useCalendarInvite';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('useCalendarInvite', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('invokes calendar invite successfully', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ user: { id: 'user-1' } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(JSON.stringify({ success: true })),
    }) as any;

    const { result } = renderHook(() => useCalendarInvite('match-1'));

    await act(async () => {
      const success = await result.current.sendInvite();
      expect(success).toBe(true);
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(result.current.isSent).toBe(true);
    expect(result.current.isSending).toBe(false);
  });

  it('handles failures returned from the edge function', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ user: { id: 'user-1' } });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(
        JSON.stringify({ success: false, error: 'failed' })
      ),
    }) as any;

    const { result } = renderHook(() => useCalendarInvite('match-1'));

    await expect(
      act(async () => {
        await result.current.sendInvite();
      })
    ).rejects.toThrow('failed');

    expect(result.current.isSent).toBe(false);
    expect(result.current.isSending).toBe(false);
  });
});
