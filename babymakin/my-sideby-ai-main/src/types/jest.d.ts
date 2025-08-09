
// This file ensures TypeScript recognizes Jest's global functions when running tests
import '@types/jest';
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      // Add other custom matchers if needed
    }
  }
}
