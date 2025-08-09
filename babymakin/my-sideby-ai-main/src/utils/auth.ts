
/**
 * Validates login form inputs
 */
export const validateLoginForm = (email: string, password: string): string | null => {
  if (!email.trim()) {
    return "Email is required";
  }
  
  if (!password.trim()) {
    return "Password is required";
  }
  
  return null;
};

/**
 * Validates signup form inputs
 */
export const validateSignUpForm = (
  email: string, 
  password: string, 
  confirmPassword: string
): string | null => {
  if (!email.trim()) {
    return "Email is required";
  }
  
  if (!password.trim()) {
    return "Password is required";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  
  return null;
};

/**
 * Returns the base URL for the current environment
 * Used for authentication callbacks
 */
export const getBaseUrl = (): string => {
  // Get the current window location origin
  const origin = window.location.origin;
  
  return origin;
};
