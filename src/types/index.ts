export interface SecurityScores {
  lighting: number;
  crowd: number;
  roadCondition: number;
  securityEnvironment: number;
  visibility: number;
}

export interface Review {
  id: string;
  user: string;
  avatar: string;
  score: number;
  content: string;
  time: string;
  scores?: SecurityScores;
}

export interface RouteItem {
  id: string;
  name: string;
  area: string;
  path: Array<{ lat: number; lng: number }>;
  distance: number;
  duration: number;
  surface: string;
  hasTrack: boolean;
  security: SecurityScores;
  overallScore: number;
  level: 'green' | 'yellow' | 'red';
  description: string;
  image: string;
  mainRoads: string[];
  reviews: Review[];
  tags: string[];
}

export interface UserReview {
  routeId: string;
  scores: SecurityScores;
  content: string;
  time: string;
}

export interface UserInfo {
  nickName: string;
  avatar: string;
}

export type SortType = 'recommend' | 'score' | 'night' | 'morning';

export interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  series: 'safety' | 'feature' | 'master';
  condition: string;
  color: string;
}

export interface EarnedBadge {
  id: string;
  routeId: string;
  time: string;
}

export interface EasterEggDef {
  id: string;
  routeId: string;
  type: 'trivia' | 'slogan' | 'history';
  title: string;
  content: string;
  icon: string;
}

export interface FoundEgg {
  id: string;
  time: string;
}

export interface DailyChallenge {
  id: string;
  type: 'explore' | 'badge' | 'area' | 'egg';
  title: string;
  desc: string;
  targetRouteId?: string;
  targetArea?: string;
  exp: number;
  completed: boolean;
}

export interface ExpRecord {
  total: number;
  level: number;
  streak: number;
  lastChallengeDate: string;
}
