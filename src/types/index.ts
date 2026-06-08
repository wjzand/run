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
