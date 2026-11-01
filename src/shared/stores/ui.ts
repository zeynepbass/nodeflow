import { create } from "zustand";

interface UiState {
  paletteOpen: boolean;
  newWorkflowOpen: boolean;
  drawerOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
  setNewWorkflowOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  paletteOpen: false,
  newWorkflowOpen: false,
  drawerOpen: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setNewWorkflowOpen: (newWorkflowOpen) => set({ newWorkflowOpen }),
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
}));
