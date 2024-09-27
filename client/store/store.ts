import { create } from "zustand";

export const useStore = create((set: any) => ({
  name: "",
  setName: (name: string) =>
    set((state: any) => ({
      name: name,
    })),
}));
