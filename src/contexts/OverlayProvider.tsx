import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OverlayContextType {
  isOpen: boolean;
  overlayId: string | null;
  openOverlay: (id: string) => void;
  closeOverlay: () => void;
  toggleOverlay: (id: string) => void;
}

const OverlayContext = createContext<OverlayContextType | undefined>(undefined);

export interface OverlayProviderProps {
  children: ReactNode;
}

export function OverlayProvider({ children }: OverlayProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [overlayId, setOverlayId] = useState<string | null>(null);

  const openOverlay = (id: string) => {
    setOverlayId(id);
    setIsOpen(true);
  };

  const closeOverlay = () => {
    setIsOpen(false);
    setOverlayId(null);
  };

  const toggleOverlay = (id: string) => {
    if (isOpen && overlayId === id) {
      closeOverlay();
    } else {
      openOverlay(id);
    }
  };

  const value: OverlayContextType = {
    isOpen,
    overlayId,
    openOverlay,
    closeOverlay,
    toggleOverlay,
  };

  return (
    <OverlayContext.Provider value={value}>
      {children}
    </OverlayContext.Provider>
  );
}

export { OverlayContext };

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (context === undefined) {
    throw new Error('useOverlay must be used within an OverlayProvider');
  }
  return context;
}