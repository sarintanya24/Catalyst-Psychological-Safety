import { create } from "zustand";
import { setToken as setApiToken } from "./api";

interface CatalystStore {
  user: any | null;
  token: string | null;
  dashboard: any | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  setDashboard: (data: any) => void;
}

export const useStore = create<CatalystStore>((set) => ({
  user: null,
  token: null,
  dashboard: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    setApiToken(token);
    set({ token });
  },
  setDashboard: (dashboard) => set({ dashboard }),
}));
