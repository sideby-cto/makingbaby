import { useState, useEffect } from "react";

export interface SignupCrew {
  id: string;
  name: string;
  code: string;
}

const SIGNUP_CREW_STORAGE_KEY = 'signup_crew_data';

export const useSignupCrew = () => {
  const [crew, setCrew] = useState<SignupCrew | null>(null);
  const [loading, setLoading] = useState(false);

  // Load crew data from storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SIGNUP_CREW_STORAGE_KEY);
      if (stored) {
        const crewData = JSON.parse(stored);
        setCrew(crewData);
      }
    } catch (error) {
      console.error('Error loading signup crew data:', error);
    }
  }, []);

  const setSignupCrew = (crewData: SignupCrew | null) => {
    setCrew(crewData);
    if (crewData) {
      try {
        sessionStorage.setItem(SIGNUP_CREW_STORAGE_KEY, JSON.stringify(crewData));
      } catch (error) {
        console.error('Error storing signup crew data:', error);
      }
    } else {
      try {
        sessionStorage.removeItem(SIGNUP_CREW_STORAGE_KEY);
      } catch (error) {
        console.error('Error removing signup crew data:', error);
      }
    }
  };

  const clearSignupCrew = () => {
    setSignupCrew(null);
  };

  const getStoredCrew = (): SignupCrew | null => {
    try {
      const stored = sessionStorage.getItem(SIGNUP_CREW_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting stored crew data:', error);
      return null;
    }
  };

  return {
    crew,
    loading,
    setSignupCrew,
    clearSignupCrew,
    getStoredCrew
  };
};