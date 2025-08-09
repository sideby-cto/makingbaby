
import { useState, useEffect } from 'react';

/**
 * Hook to manage hidden users during matchmaking sessions
 * Uses session storage to persist state during a browser session
 */
export const useHiddenUsers = () => {
  const [hiddenUsers, setHiddenUsers] = useState<string[]>(() => {
    // Initialize from session storage if available
    const stored = sessionStorage.getItem('hiddenUsers');
    return stored ? JSON.parse(stored) : [];
  });

  // Toggle visibility for a user
  const toggleUserVisibility = (userId: string) => {
    setHiddenUsers(current => {
      if (current.includes(userId)) {
        return current.filter(id => id !== userId);
      } else {
        return [...current, userId];
      }
    });
  };

  // Check if a user is hidden
  const isUserHidden = (userId: string): boolean => {
    return hiddenUsers.includes(userId);
  };

  // Reset all hidden users
  const resetHiddenUsers = () => {
    setHiddenUsers([]);
  };

  // Hide a specific user
  const hideUser = (userId: string) => {
    if (!isUserHidden(userId)) {
      setHiddenUsers(current => [...current, userId]);
    }
  };

  // Show a specific user
  const showUser = (userId: string) => {
    setHiddenUsers(current => current.filter(id => id !== userId));
  };

  // Persist to session storage whenever the hiddenUsers array changes
  useEffect(() => {
    sessionStorage.setItem('hiddenUsers', JSON.stringify(hiddenUsers));
  }, [hiddenUsers]);

  return {
    hiddenUsers,
    toggleUserVisibility,
    isUserHidden,
    resetHiddenUsers,
    hideUser,
    showUser
  };
};
