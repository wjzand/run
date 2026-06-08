export const LEVEL_CONFIG = [
  { level: 1, name: '初级跑者', minExp: 0, icon: '🌱' },
  { level: 2, name: '初级跑者', minExp: 50, icon: '🌱' },
  { level: 3, name: '进阶跑者', minExp: 150, icon: '🌿' },
  { level: 4, name: '进阶跑者', minExp: 300, icon: '🌿' },
  { level: 5, name: '资深跑者', minExp: 550, icon: '🌳' },
  { level: 6, name: '资深跑者', minExp: 900, icon: '🌳' },
  { level: 7, name: '精英跑者', minExp: 1400, icon: '⭐' },
  { level: 8, name: '精英跑者', minExp: 2100, icon: '⭐' },
  { level: 9, name: '传奇探险家', minExp: 3000, icon: '🏆' },
  { level: 10, name: '传奇探险家', minExp: 4200, icon: '🏆' },
];

export const EXP_REWARDS = {
  browseRoute: 5,
  favoriteRoute: 10,
  writeReview: 15,
  unlockRoute: 20,
  findEgg: 25,
  completeChallenge: 30,
  earnBadge: 50,
};

export function calcLevel(exp: number): number {
  for (let i = LEVEL_CONFIG.length - 1; i >= 0; i--) {
    if (exp >= LEVEL_CONFIG[i].minExp) return LEVEL_CONFIG[i].level;
  }
  return 1;
}

export function getLevelName(level: number): string {
  const cfg = LEVEL_CONFIG.find((c) => c.level === level);
  return cfg ? cfg.name : '初级跑者';
}

export function getLevelIcon(level: number): string {
  const cfg = LEVEL_CONFIG.find((c) => c.level === level);
  return cfg ? cfg.icon : '🌱';
}

export function getExpForNextLevel(exp: number): { current: number; needed: number; progress: number } {
  const currentLevel = calcLevel(exp);
  const currentCfg = LEVEL_CONFIG.find((c) => c.level === currentLevel);
  const nextCfg = LEVEL_CONFIG.find((c) => c.level === currentLevel + 1);
  if (!nextCfg) return { current: exp, needed: exp, progress: 1 };
  const base = currentCfg ? currentCfg.minExp : 0;
  const target = nextCfg.minExp;
  const progress = (exp - base) / (target - base);
  return { current: exp, needed: target, progress: Math.min(progress, 1) };
}
