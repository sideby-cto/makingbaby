
import React, { createContext, useContext } from "react";
import { useFeatureFlags, FeatureFlags, FeatureFlagKey } from "@/hooks/useFeatureFlags";

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  setFlag: (flag: FeatureFlagKey, value: boolean) => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { flags, setFlag } = useFeatureFlags();
  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlag }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export function useFeatureFlagsContext() {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error("useFeatureFlagsContext must be used within FeatureFlagsProvider");
  return ctx;
}
