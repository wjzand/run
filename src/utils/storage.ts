import Taro from '@tarojs/taro';
import type { UserInfo, UserReview, EarnedBadge, FoundEgg, ExpRecord, DailyChallenge } from '@/types';
import { calcLevel, EXP_REWARDS } from '@/data/levels';
import BADGES, { BADGE_CHECKS } from '@/data/badges';
import routes from '@/data/routes';

const KEYS = {
  favorites: 'saferun_favorites',
  myReviews: 'saferun_myReviews',
  history: 'saferun_history',
  userInfo: 'saferun_userInfo',
  searchHistory: 'saferun_searchHistory',
  exploredRoutes: 'saferun_exploredRoutes',
  exploredAreas: 'saferun_exploredAreas',
  earnedBadges: 'saferun_earnedBadges',
  foundEggs: 'saferun_foundEggs',
  expRecord: 'saferun_expRecord',
  dailyChallenge: 'saferun_dailyChallenge',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const val = Taro.getStorageSync(key);
    return val || fallback;
  } catch (e) {
    return fallback;
  }
}

function safeSet(key: string, value: any): void {
  try {
    Taro.setStorageSync(key, value);
  } catch (e) {
    console.error('[Storage] set error', key, e);
  }
}

export function getFavorites(): string[] {
  return safeGet(KEYS.favorites, []);
}

export function setFavorites(ids: string[]): void {
  safeSet(KEYS.favorites, ids);
}

export function toggleFavorite(id: string): boolean {
  const list = getFavorites();
  const idx = list.indexOf(id);
  if (idx >= 0) { list.splice(idx, 1); } else { list.push(id); }
  setFavorites(list);
  return idx < 0;
}

export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

export function getMyReviews(): UserReview[] {
  return safeGet(KEYS.myReviews, []);
}

export function addMyReview(review: UserReview): void {
  const list = getMyReviews();
  list.push(review);
  safeSet(KEYS.myReviews, list);
}

export function removeMyReview(routeId: string): void {
  safeSet(KEYS.myReviews, getMyReviews().filter((r) => r.routeId !== routeId));
}

export function getHistory(): string[] {
  return safeGet(KEYS.history, []);
}

export function addHistory(id: string): void {
  let list = getHistory().filter((item) => item !== id);
  list.unshift(id);
  if (list.length > 20) list = list.slice(0, 20);
  safeSet(KEYS.history, list);
}

export function clearHistory(): void {
  try { Taro.removeStorageSync(KEYS.history); } catch (e) { /* noop */ }
}

export function getUserInfo(): UserInfo {
  return safeGet(KEYS.userInfo, { nickName: '跑友小明', avatar: '' });
}

export function setUserInfo(info: UserInfo): void {
  safeSet(KEYS.userInfo, info);
}

export function getSearchHistory(): string[] {
  return safeGet(KEYS.searchHistory, []);
}

export function addSearchHistory(keyword: string): void {
  let list = getSearchHistory().filter((item) => item !== keyword);
  list.unshift(keyword);
  if (list.length > 5) list = list.slice(0, 5);
  safeSet(KEYS.searchHistory, list);
}

export function clearSearchHistory(): void {
  try { Taro.removeStorageSync(KEYS.searchHistory); } catch (e) { /* noop */ }
}

export function getExploredRoutes(): string[] {
  return safeGet(KEYS.exploredRoutes, []);
}

export function addExploredRoute(id: string): boolean {
  const list = getExploredRoutes();
  if (list.includes(id)) return false;
  list.push(id);
  safeSet(KEYS.exploredRoutes, list);
  return true;
}

export function getExploredAreas(): string[] {
  return safeGet(KEYS.exploredAreas, []);
}

function recalcExploredAreas(): void {
  const explored = getExploredRoutes();
  const areaRoutes: Record<string, string[]> = {};
  routes.forEach((r) => {
    if (!areaRoutes[r.area]) areaRoutes[r.area] = [];
    areaRoutes[r.area].push(r.id);
  });
  const completed: string[] = [];
  Object.entries(areaRoutes).forEach(([area, routeIds]) => {
    if (routeIds.every((rid) => explored.includes(rid))) {
      completed.push(area);
    }
  });
  safeSet(KEYS.exploredAreas, completed);
}

export function getExplorationProgress(): number {
  const explored = getExploredRoutes();
  return Math.round((explored.length / routes.length) * 100);
}

export function getEarnedBadges(): EarnedBadge[] {
  return safeGet(KEYS.earnedBadges, []);
}

export function addEarnedBadge(badge: EarnedBadge): void {
  const list = getEarnedBadges();
  if (list.some((b) => b.id === badge.id)) return;
  list.push(badge);
  safeSet(KEYS.earnedBadges, list);
  addExp(EXP_REWARDS.earnBadge);
}

export function getFoundEggs(): FoundEgg[] {
  return safeGet(KEYS.foundEggs, []);
}

export function addFoundEgg(egg: FoundEgg): void {
  const list = getFoundEggs();
  if (list.some((e) => e.id === egg.id)) return;
  list.push(egg);
  safeSet(KEYS.foundEggs, list);
  addExp(EXP_REWARDS.findEgg);
}

export function getExpRecord(): ExpRecord {
  return safeGet(KEYS.expRecord, { total: 0, level: 1, streak: 0, lastChallengeDate: '' });
}

export function addExp(amount: number): void {
  const record = getExpRecord();
  record.total += amount;
  record.level = calcLevel(record.total);
  safeSet(KEYS.expRecord, record);
}

export function getDailyChallenge(): DailyChallenge | null {
  const today = new Date().toISOString().split('T')[0];
  const stored = safeGet<{ date: string; challenge: DailyChallenge } | null>(KEYS.dailyChallenge, null);
  if (!stored || stored.date !== today) return null;
  return stored.challenge;
}

export function generateDailyChallenge(): DailyChallenge {
  const today = new Date().toISOString().split('T')[0];
  const existing = getDailyChallenge();
  if (existing) return existing;

  const unexplored = routes.filter((r) => !getExploredRoutes().includes(r.id));
  const targetRoute = unexplored.length > 0 ? unexplored[Math.floor(Math.random() * unexplored.length)] : routes[Math.floor(Math.random() * routes.length)];
  const areas = [...new Set(routes.map((r) => r.area))];
  const targetArea = areas[Math.floor(Math.random() * areas.length)];
  const types: Array<DailyChallenge['type']> = ['explore', 'badge', 'area', 'egg'];
  const type = types[Math.floor(Math.random() * types.length)];

  const challengeMap: Record<DailyChallenge['type'], DailyChallenge> = {
    explore: { id: 'dc_explore', type: 'explore', title: '每日探索', desc: `去探索「${targetRoute.name}」吧！`, targetRouteId: targetRoute.id, exp: EXP_REWARDS.completeChallenge, completed: false },
    badge: { id: 'dc_badge', type: 'badge', title: '勋章挑战', desc: '完成一条新路线来获取勋章', exp: EXP_REWARDS.completeChallenge, completed: false },
    area: { id: 'dc_area', type: 'area', title: '区域挑战', desc: `探索${targetArea}的任意一条路线`, targetArea, exp: EXP_REWARDS.completeChallenge, completed: false },
    egg: { id: 'dc_egg', type: 'egg', title: '彩蛋猎人', desc: '浏览路线详情，发现隐藏彩蛋', exp: EXP_REWARDS.completeChallenge, completed: false },
  };

  const challenge = challengeMap[type];
  safeSet(KEYS.dailyChallenge, { date: today, challenge });
  return challenge;
}

export function completeDailyChallenge(): void {
  const today = new Date().toISOString().split('T')[0];
  const challenge = getDailyChallenge();
  if (!challenge || challenge.completed) return;
  challenge.completed = true;
  safeSet(KEYS.dailyChallenge, { date: today, challenge });
  addExp(EXP_REWARDS.completeChallenge);
  const record = getExpRecord();
  if (record.lastChallengeDate) {
    const last = new Date(record.lastChallengeDate);
    const diff = Math.floor((new Date(today).getTime() - last.getTime()) / 86400000);
    if (diff === 1) record.streak += 1;
    else if (diff > 1) record.streak = 1;
  } else {
    record.streak = 1;
  }
  record.lastChallengeDate = today;
  safeSet(KEYS.expRecord, record);
}

export function checkAndAwardBadges(routeId: string): string[] {
  const route = routes.find((r) => r.id === routeId);
  if (!route) return [];
  const earned = getEarnedBadges();
  const earnedIds = earned.map((b) => b.id);
  const newBadges: string[] = [];
  const now = new Date().toISOString().split('T')[0];

  BADGES.filter((b) => b.series !== 'master' && !earnedIds.includes(b.id) && BADGE_CHECKS[b.id]?.(route))
    .forEach((b) => {
      addEarnedBadge({ id: b.id, routeId, time: now });
      newBadges.push(b.id);
    });

  const safetyIds = BADGES.filter((b) => b.series === 'safety').map((b) => b.id);
  if (safetyIds.every((sid) => getEarnedBadges().some((eb) => eb.id === sid))) {
    if (!earnedIds.includes('b_master_safety')) {
      addEarnedBadge({ id: 'b_master_safety', routeId: '', time: now });
      newBadges.push('b_master_safety');
    }
  }
  const featureIds = BADGES.filter((b) => b.series === 'feature').map((b) => b.id);
  if (featureIds.every((fid) => getEarnedBadges().some((eb) => eb.id === fid))) {
    if (!earnedIds.includes('b_master_explorer')) {
      addEarnedBadge({ id: 'b_master_explorer', routeId: '', time: now });
      newBadges.push('b_master_explorer');
    }
  }

  return newBadges;
}

export function onRouteExplored(routeId: string): { newBadges: string[]; newArea: boolean; progress: number } {
  const isNew = addExploredRoute(routeId);
  if (!isNew) return { newBadges: [], newArea: false, progress: getExplorationProgress() };
  addExp(EXP_REWARDS.unlockRoute);
  recalcExploredAreas();
  const prevAreas = getExploredAreas();
  const route = routes.find((r) => r.id === routeId);
  const newArea = route ? prevAreas.includes(route.area) : false;
  const newBadges = checkAndAwardBadges(routeId);
  return { newBadges, newArea, progress: getExplorationProgress() };
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => {
    try { Taro.removeStorageSync(key); } catch (e) { /* noop */ }
  });
}
