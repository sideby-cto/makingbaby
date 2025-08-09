
import { useCallback, useEffect, useState } from "react";

export type FeatureFlagKey = "automaticMatchingBeta" | "newDashboardBeta" | "newUserFlowBeta";

const FLAG_STORAGE_KEY = "sideby_feature_flags";

export type FeatureFlags = {
  [key in FeatureFlagKey]?: boolean;
};

const defaultFlags: FeatureFlags = {
  automaticMatchingBeta: false,
  newDashboardBeta: false,
  newUserFlowBeta: false,
};

export function getInitialFlags(): FeatureFlags {
  try {
    const fromStorage = localStorage.getItem(FLAG_STORAGE_KEY);
    if (fromStorage) {
      return { ...defaultFlags, ...JSON.parse(fromStorage) };
    }
  } catch {
    // No-op, probably invalid JSON
  }
  return { ...defaultFlags };
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(() => getInitialFlags());

  useEffect(() => {
    localStorage.setItem(FLAG_STORAGE_KEY, JSON.stringify(flags));
  }, [flags]);

  const setFlag = useCallback(
    (flag: FeatureFlagKey, value: boolean) => {
      setFlags(current => ({ ...current, [flag]: value }));
    },
    []
  );

  return {
    flags,
    setFlag,
  };
}
