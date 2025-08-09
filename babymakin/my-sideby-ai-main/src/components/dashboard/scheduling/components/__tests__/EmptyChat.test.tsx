
import React from 'react';
import { render, screen } from '@testing-library/react';
import { EmptyChat } from '../EmptyChat';

describe('EmptyChat Component', () => {
  it('renders the empty state messages', () => {
    render(<EmptyChat partnerName="Test Partner" />);
    
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText(/Start your sideby session with Test Partner/)).toBeInTheDocument();
  });
});
