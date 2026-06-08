import { create } from 'zustand';
import type { UserInfo } from '@/types';
import { getUserInfo, setUserInfo as saveUserInfo } from '@/utils/storage';

interface AppState {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  refreshUserInfo: () => void;
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
}));

export default useAppStore;
