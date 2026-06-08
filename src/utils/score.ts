import type { SecurityScores } from '@/types';

const WEIGHTS = {
  lighting: 0.20,
  crowd: 0.20,
  roadCondition: 0.20,
  securityEnvironment: 0.25,
  visibility: 0.15,
};

export function calcOverallScore(security: SecurityScores): number {
  const total =
    security.lighting * WEIGHTS.lighting +
    security.crowd * WEIGHTS.crowd +
    security.roadCondition * WEIGHTS.roadCondition +
    security.securityEnvironment * WEIGHTS.securityEnvironment +
    security.visibility * WEIGHTS.visibility;
  return Math.round(total * 10) / 10;
}

export function getLevel(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 4.0) return 'green';
  if (score >= 3.0) return 'yellow';
  return 'red';
}

export function getLevelText(level: 'green' | 'yellow' | 'red'): string {
  const map = { green: '安全', yellow: '一般', red: '需注意' };
  return map[level];
}

export function getLevelColor(level: 'green' | 'yellow' | 'red'): string {
  const map = { green: '#00b42a', yellow: '#ff7d00', red: '#f53f3f' };
  return map[level];
}

export function calcAverageSecurity(
  base: SecurityScores,
  userScores: SecurityScores[]
): SecurityScores {
  if (userScores.length === 0) return base;
  const allScores = [base, ...userScores];
  const avg = (key: keyof SecurityScores) => {
    const sum = allScores.reduce((acc, s) => acc + s[key], 0);
    return Math.round((sum / allScores.length) * 10) / 10;
  };
  return {
    lighting: avg('lighting'),
    crowd: avg('crowd'),
    roadCondition: avg('roadCondition'),
    securityEnvironment: avg('securityEnvironment'),
    visibility: avg('visibility'),
  };
}
