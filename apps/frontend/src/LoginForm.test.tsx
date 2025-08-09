import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

test('allows user to login', async () => {
  const user = userEvent.setup();
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({ message: 'Login successful' })
  } as Response);

  render(<LoginForm />);

  await user.type(screen.getByPlaceholderText(/username/i), 'admin');
  await user.type(screen.getByPlaceholderText(/password/i), 'password');
  await user.click(screen.getByRole('button', { name: /login/i }));

  expect(await screen.findByText(/logged in/i)).toBeInTheDocument();
});
