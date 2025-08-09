/**
 * Utility functions for signup process
 */

/**
 * Generates a proper UUID for transaction tracking
 * Uses crypto.randomUUID() if available, otherwise falls back to UUID v4 format
 */
export const generateTransactionId = (): string => {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback UUID v4 format for older browsers or environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Validates if a string is a proper UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates signup form data
 */
export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export const validateSignupForm = (formData: SignupFormData): string | null => {
  const { email, password, confirmPassword, firstName, lastName } = formData;
  
  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    return "All fields are required.";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }
  
  return null;
};

/**
 * Signup step names for consistent logging
 */
export enum SignupStep {
  AUTH_USER_CREATION = 'auth_user_creation',
  PROFILE_CREATION = 'profile_creation',
  UPDUO_INTEGRATION = 'upduo_integration',
  COMMUNITY_JOIN = 'community_join',
  ONBOARDING_COMPLETE = 'onboarding_complete'
}

/**
 * Signup status types
 */
export enum SignupStatus {
  STARTED = 'started',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Error codes for specific signup issues
 */
export enum SignupErrorCode {
  DUPLICATE_EMAIL = 'duplicate_email',
  RATE_LIMIT = 'rate_limit',
  INVALID_PASSWORD = 'invalid_password',
  INVALID_EMAIL = 'invalid_email',
  PROFILE_CREATION_FAILED = 'profile_creation_failed',
  COMMUNITY_JOIN_FAILED = 'community_join_failed',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Gets a user-friendly error message for signup errors
 */
export const getSignupErrorMessage = (error: any): { code: SignupErrorCode; message: string } => {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('already registered') || errorMessage.includes('duplicate')) {
    return {
      code: SignupErrorCode.DUPLICATE_EMAIL,
      message: "This email is already registered. Please try logging in instead."
    };
  }
  
  if (errorMessage.includes('rate limit') || error?.code === 'over_email_send_rate_limit') {
    return {
      code: SignupErrorCode.RATE_LIMIT,
      message: "Email rate limit exceeded. Please try again later or use Google Sign-in."
    };
  }
  
  if (errorMessage.includes('password')) {
    return {
      code: SignupErrorCode.INVALID_PASSWORD,
      message: "Password does not meet requirements. Please ensure it's at least 8 characters long."
    };
  }
  
  if (errorMessage.includes('email')) {
    return {
      code: SignupErrorCode.INVALID_EMAIL,
      message: "Please enter a valid email address."
    };
  }
  
  if (errorMessage.includes('profile creation')) {
    return {
      code: SignupErrorCode.PROFILE_CREATION_FAILED,
      message: "Failed to create user profile. Please try refreshing the page and logging in again."
    };
  }
  
  if (errorMessage.includes('community')) {
    return {
      code: SignupErrorCode.COMMUNITY_JOIN_FAILED,
      message: "Failed to join community. Please try again or contact support."
    };
  }
  
  return {
    code: SignupErrorCode.UNKNOWN_ERROR,
    message: error?.message || "Failed to create account. Please try again."
  };
};