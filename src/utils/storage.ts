import Taro from '@tarojs/taro';
import type { UserInfo, UserReview } from '@/types';

const KEYS = {
  favorites: 'saferun_favorites',
  myReviews: 'saferun_myReviews',
  history: 'saferun_history',
  userInfo: 'saferun_userInfo',
  searchHistory: 'saferun_searchHistory',
};

export function getFavorites(): string[] {
  try {
    return Taro.getStorageSync(KEYS.favorites) || [];
  } catch (e) {
    console.error('[Storage] getFavorites error', e);
    return [];
  }
}

export function setFavorites(ids: string[]): void {
  try {
    Taro.setStorageSync(KEYS.favorites, ids);
  } catch (e) {
    console.error('[Storage] setFavorites error', e);
  }
}

export function toggleFavorite(id: string): boolean {
  const list = getFavorites();
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(id);
  }
  setFavorites(list);
  return idx < 0;
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function getMyReviews(): UserReview[] {
  try {
    return Taro.getStorageSync(KEYS.myReviews) || [];
  } catch (e) {
    console.error('[Storage] getMyReviews error', e);
    return [];
  }
}

export function addMyReview(review: UserReview): void {
  const list = getMyReviews();
  list.push(review);
  try {
    Taro.setStorageSync(KEYS.myReviews, list);
  } catch (e) {
    console.error('[Storage] addMyReview error', e);
  }
}

export function removeMyReview(routeId: string): void {
  const list = getMyReviews().filter((r) => r.routeId !== routeId);
  try {
    Taro.setStorageSync(KEYS.myReviews, list);
  } catch (e) {
    console.error('[Storage] removeMyReview error', e);
  }
}

export function getHistory(): string[] {
  try {
    return Taro.getStorageSync(KEYS.history) || [];
  } catch (e) {
    console.error('[Storage] getHistory error', e);
    return [];
  }
}

export function addHistory(id: string): void {
  let list = getHistory();
  list = list.filter((item) => item !== id);
  list.unshift(id);
  if (list.length > 20) list = list.slice(0, 20);
  try {
    Taro.setStorageSync(KEYS.history, list);
  } catch (e) {
    console.error('[Storage] addHistory error', e);
  }
}

export function clearHistory(): void {
  try {
    Taro.removeStorageSync(KEYS.history);
  } catch (e) {
    console.error('[Storage] clearHistory error', e);
  }
}

export function getUserInfo(): UserInfo {
  try {
    return Taro.getStorageSync(KEYS.userInfo) || { nickName: '跑友小明', avatar: '' };
  } catch (e) {
    console.error('[Storage] getUserInfo error', e);
    return { nickName: '跑友小明', avatar: '' };
  }
}

export function setUserInfo(info: UserInfo): void {
  try {
    Taro.setStorageSync(KEYS.userInfo, info);
  } catch (e) {
    console.error('[Storage] setUserInfo error', e);
  }
}

export function getSearchHistory(): string[] {
  try {
    return Taro.getStorageSync(KEYS.searchHistory) || [];
  } catch (e) {
    console.error('[Storage] getSearchHistory error', e);
    return [];
  }
}

export function addSearchHistory(keyword: string): void {
  let list = getSearchHistory();
  list = list.filter((item) => item !== keyword);
  list.unshift(keyword);
  if (list.length > 5) list = list.slice(0, 5);
  try {
    Taro.setStorageSync(KEYS.searchHistory, list);
  } catch (e) {
    console.error('[Storage] addSearchHistory error', e);
  }
}

export function clearSearchHistory(): void {
  try {
    Taro.removeStorageSync(KEYS.searchHistory);
  } catch (e) {
    console.error('[Storage] clearSearchHistory error', e);
  }
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => {
    try {
      Taro.removeStorageSync(key);
    } catch (e) {
      console.error('[Storage] clearAllData error', e);
    }
  });
}
