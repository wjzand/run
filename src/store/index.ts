import { create } from 'zustand';
import type { UserInfo } from '@/types';
import { getUserInfo, setUserInfo as saveUserInfo, getExpRecord } from '@/utils/storage';

interface AppState {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  refreshUserInfo: () => void;
  expVersion: number;
  bumpExp: () => void;
}

const useAppStore = create<AppState>((set) => ({
  userInfo: getUserInfo(),
  setUserInfo: (info: UserInfo) => {
    saveUserInfo(info);
    set({ userInfo: info });
  },
  refreshUserInfo: () => {
    set({ userInfo: getUserInfo() });
  },
  expVersion: 0,
  bumpExp: () => set((s) => ({ expVersion: s.expVersion + 1 })),
}));

export default useAppStore;
