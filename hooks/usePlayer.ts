import { create } from 'zustand';

interface PlayerStore {
  ids: number[];
  activeId?: number;
  setId: (id: number) => void;
  setIds: (ids: number[]) => void;
  reset: () => void;
}

const usePlayer = create<PlayerStore>((set) => ({
  ids: [],
  activeId: undefined,
  setId: (id) => set((state) => ({ ...state, activeId: id })),
  setIds: (ids) => set((state) => ({ ...state, ids })),
  reset: () => set((state) => ({ ...state, ids: [], activeId: undefined })),
}));

export default usePlayer;
