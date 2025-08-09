
import { vi } from 'vitest';

// Set up environment variables for tests if they're not already set
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
}

if (!process.env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = 'example-anon-key';
}

// Create properly typed dummy mock functions
const createNoOpMock = () => {
  return vi.fn().mockImplementation(() => {});
};

// Mock modules without actually executing their code
vi.mock('@testing-library/react-hooks', () => ({}));
vi.mock('@testing-library/react', () => ({}));
vi.mock('react', () => ({
  useState: createNoOpMock(),
  useEffect: createNoOpMock(),
  useContext: createNoOpMock(),
  createContext: createNoOpMock(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({}),
    auth: {
      signUp: createNoOpMock(),
      signIn: createNoOpMock(),
      signOut: createNoOpMock(),
    },
    functions: {
      invoke: createNoOpMock(),
    },
  }),
}));
