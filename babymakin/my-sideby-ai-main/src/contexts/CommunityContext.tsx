import { createContext, useContext, useState } from "react";

type Community = {
  id: string;
  name: string;
  description?: string | null;
};

type CommunityContextType = {
  selectedCommunity: Community | null;
  setSelectedCommunity: (community: Community | null) => void;
};

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  return (
    <CommunityContext.Provider value={{ selectedCommunity, setSelectedCommunity }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
}