
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SchedulingChat from '../SchedulingChat';
import { ChatInput } from '../components/ChatInput';
import * as useSchedulingMessagesHook from '../hooks/useSchedulingMessages';

// Mock the useSchedulingMessages hook
vi.mock('../hooks/useSchedulingMessages', () => {
  return {
    useSchedulingMessages: vi.fn()
  };
});

describe('SchedulingChat Component', () => {
  const mockMatch = {
    id: 'match-123',
    user1_id: 'user1',
    user2_id: 'user2',
    user1: {
      id: 'user1',
      first_name: 'User',
      last_name: 'One',
      avatar_url: null
    },
    user2: {
      id: 'user2',
      first_name: 'User',
      last_name: 'Two',
      avatar_url: null
    },
    status: 'active',
    created_at: new Date().toISOString(),
    completed_at: null,
    completion_notes: null,
    completed_by: null,
    upduo_session_id: null,
    upduo_session_name: null
  };
  
  const mockUserId = 'user1';
  
  const mockMessages = [
    {
      id: 'msg1',
      match_id: 'match-123',
      sender_id: 'user1',
      content: 'Hello, are you available on Monday?',
      created_at: new Date().toISOString(),
    },
    {
      id: 'msg2',
      match_id: 'match-123',
      sender_id: 'user2',
      content: 'Yes, Monday works for me.',
      created_at: new Date().toISOString(),
    }
  ];

  const mockHookReturn = {
    messages: mockMessages,
    newMessage: '',
    setNewMessage: vi.fn(),
    isSending: false,
    sendMessage: vi.fn(),
    loading: false,
    partnerInfo: { id: 'user2', name: 'User Two' },
    refreshMessages: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSchedulingMessagesHook.useSchedulingMessages as any).mockReturnValue(mockHookReturn);
  });

  it('renders the SchedulingChat component with messages', () => {
    render(<SchedulingChat match={mockMatch} userId={mockUserId} />);
    
    // Check if header is rendered
    expect(screen.getByText('Scheduling Chat')).toBeInTheDocument();
    
    // Check if messages are rendered
    expect(screen.getByText('Hello, are you available on Monday?')).toBeInTheDocument();
    expect(screen.getByText('Yes, Monday works for me.')).toBeInTheDocument();
    
    // Check if input is rendered
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });
});

describe('ChatInput Component', () => {
  const mockOnChange = vi.fn();
  const mockOnSend = vi.fn();
  const mockOnKeyPress = vi.fn();
  const mockOnUpload = vi.fn();

  it('renders the input field with the correct value', () => {
    render(
      <ChatInput
        value="Hello"
        onChange={mockOnChange}
        onSend={mockOnSend}
        onKeyPress={mockOnKeyPress}
        isLoading={false}
        isUploading={false}
        onUpload={mockOnUpload}
      />
    );
    
    const inputEl = screen.getByPlaceholderText('Type your message...') as HTMLInputElement;
    expect(inputEl.value).toBe('Hello');
  });

  it('calls onChange when input changes', () => {
    render(
      <ChatInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
        onKeyPress={mockOnKeyPress}
        isLoading={false}
        isUploading={false}
      />
    );
    
    const inputEl = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(inputEl, { target: { value: 'New message' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onKeyPress when Enter key is pressed', () => {
    render(
      <ChatInput
        value="Hello"
        onChange={mockOnChange}
        onSend={mockOnSend}
        onKeyPress={mockOnKeyPress}
        isLoading={false}
        isUploading={false}
      />
    );
    
    const inputEl = screen.getByPlaceholderText('Type your message...');
    fireEvent.keyDown(inputEl, { key: 'Enter' });
    
    expect(mockOnKeyPress).toHaveBeenCalled();
  });

  it('disables the button when isLoading is true', () => {
    render(
      <ChatInput
        value=""
        onChange={mockOnChange}
        onSend={mockOnSend}
        onKeyPress={mockOnKeyPress}
        isLoading={true}
        isUploading={false}
      />
    );
    
    const button = screen.getByRole('button', { name: /send message/i });
    expect(button).toBeDisabled();
  });
});
