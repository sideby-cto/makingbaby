
/**
 * Utility functions for staging environment protection
 */

// The password for accessing the staging environment
const STAGING_PASSWORD = "sideby2025!";

/**
 * Checks if the current environment is staging
 * @returns Boolean indicating whether the app is running in staging
 */
export const isStaging = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === 'staging.sideby.ai' || 
         hostname.includes('staging.sideby') || 
         hostname.includes('staging-sideby');
};

/**
 * Checks if the user has provided the correct password for the staging environment
 * @returns Boolean indicating whether the user has access
 */
export const hasStageAccess = (): boolean => {
  // If not in staging, always allow access
  if (!isStaging()) return true;
  
  // Check if the user has the staging access token in localStorage
  return localStorage.getItem('staging_access_token') === 'granted';
};

/**
 * Verify the provided password and grant access if correct
 * @param password The password to verify
 * @returns Boolean indicating whether the password was correct
 */
export const verifyStagePassword = (password: string): boolean => {
  const isCorrect = password === STAGING_PASSWORD;
  
  if (isCorrect) {
    localStorage.setItem('staging_access_token', 'granted');
  }
  
  return isCorrect;
};

/**
 * Revoke stage access
 */
export const revokeStageAccess = (): void => {
  localStorage.removeItem('staging_access_token');
};

/**
 * Determines if access should be restricted based on environment
 * @returns Boolean indicating whether access should be restricted
 */
export const shouldRestrictAccess = (): boolean => {
  // Only restrict access in staging environment
  if (!isStaging()) return false;
  
  // In staging, check if the user has provided the correct password
  return !hasStageAccess();
};

/**
 * Check if the current path should bypass password protection
 * @param path Current URL path
 * @returns Boolean indicating whether the path should bypass protection
 */
export const isBypassPath = (path: string): boolean => {
  // Allow auth-related paths without password
  return path.startsWith('/login') ||
         path.startsWith('/register') ||
         path.startsWith('/auth/') ||
         path.startsWith('/values');
};
