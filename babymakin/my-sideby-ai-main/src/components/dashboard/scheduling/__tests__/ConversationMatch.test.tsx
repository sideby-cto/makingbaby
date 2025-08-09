
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ConversationsList } from '../components/ConversationsList';

describe('ConversationsList Component', () => {
  const mockMatches = [
    {
      id: 'match1',
      user1_id: 'user1',
      user2_id: 'user2',
      status: 'active',
      created_at: '2025-03-10T15:00:00Z',
      updated_at: '2025-03-10T15:00:00Z', // Added updated_at
      user1: {
        id: 'user1',
        first_name: 'John',
        last_name: 'Doe'
      },
      user2: {
        id: 'user2',
        first_name: 'Jane',
        last_name: 'Smith'
      }
    },
    {
      id: 'match2',
      user1_id: 'user1',
      user2_id: 'user3',
      status: 'active',
      created_at: '2025-03-08T15:00:00Z',
      updated_at: '2025-03-08T15:00:00Z', // Added updated_at
      user1: {
        id: 'user1',
        first_name: 'John',
        last_name: 'Doe'
      },
      user2: {
        id: 'user3',
        first_name: 'Bob',
        last_name: 'Johnson'
      }
    }
  ];

  const mockUserId = 'user1';
  const mockOnSelectMatch = vi.fn();

  test('renders conversations list correctly', () => {
    render(
      <ConversationsList
        matches={mockMatches}
        selectedMatchId={null}
        onSelectMatch={mockOnSelectMatch}
        userId={mockUserId}
        isLoading={false}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  test('calls onSelectMatch when a conversation is clicked', () => {
    render(
      <ConversationsList
        matches={mockMatches}
        selectedMatchId={null}
        onSelectMatch={mockOnSelectMatch}
        userId={mockUserId}
        isLoading={false}
      />
    );

    const firstConversation = screen.getByText('Jane Smith').closest('button');
    fireEvent.click(firstConversation);

    expect(mockOnSelectMatch).toHaveBeenCalledWith('match1');
  });

  test('displays loading state correctly', () => {
    render(
      <ConversationsList
        matches={[]}
        selectedMatchId={null}
        onSelectMatch={() => {}}
        userId={mockUserId}
        isLoading={true}
      />
    );

    // Check for loading indicators (you may need to adjust this based on your actual loading UI)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('displays empty state correctly', () => {
    render(
      <ConversationsList
        matches={[]}
        selectedMatchId={null}
        onSelectMatch={() => {}}
        userId={mockUserId}
        isLoading={false}
      />
    );

    expect(screen.getByText('No conversations found')).toBeInTheDocument();
  });

  test('highlights selected conversation', () => {
    render(
      <ConversationsList
        matches={mockMatches}
        selectedMatchId="match1"
        onSelectMatch={() => {}}
        userId={mockUserId}
        isLoading={false}
      />
    );

    const selectedConversation = screen.getByText('Jane Smith').closest('button');
    expect(selectedConversation).toHaveClass('bg-muted');
  });
});
