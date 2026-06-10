import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, Map } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import RouteCard from '@/components/RouteCard';
import ChallengeCard from '@/components/ChallengeCard';
import ProgressRing from '@/components/ProgressRing';
import routes from '@/data/routes';
import type { SortType } from '@/types';
import {
  getExplorationProgress,
  getExploredRoutes,
  generateDailyChallenge,
  completeDailyChallenge,
  getDailyChallenge,
} from '@/utils/storage';
import styles from './index.module.scss';

const FILTER_OPTIONS: { key: SortType; label: string }[] = [
  { key: 'recommend', label: '智能推荐' },
  { key: 'score', label: '评分最高' },
  { key: 'night', label: '夜跑推荐' },
  { key: 'morning', label: '晨跑推荐' },
];

const PAGE_SIZE = 6;

const HomePage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<SortType>('recommend');
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const explorationProgress = useMemo(() => getExplorationProgress(), [tick]);
  const exploredRoutes = useMemo(() => getExploredRoutes(), [tick]);
  const dailyChallenge = useMemo(() => {
    const ch = getDailyChallenge();
    return ch || generateDailyChallenge();
  }, [tick]);

  const sortedRoutes = useCallback(() => {
    const list = [...routes];
    switch (activeFilter) {
      case 'score':
        return list.sort((a, b) => b.overallScore - a.overallScore);
      case 'night':
        return list
          .filter((r) => r.security.lighting >= 3.5)
          .sort((a, b) => b.security.lighting - a.security.lighting);
      case 'morning':
        return list
          .filter((r) => r.security.crowd >= 3.0)
          .sort((a, b) => b.security.crowd - a.security.crowd);
      default:
        return list;
    }
  }, [activeFilter]);

  const displayRoutes = sortedRoutes().slice(0, page * PAGE_SIZE);
  const hasMore = displayRoutes.length < sortedRoutes().length;

  const handleFilterChange = (key: SortType) => {
    setActiveFilter(key);
    setPage(1);
  };

  const handleRouteClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleSearchClick = () => {
    Taro.switchTab({ url: '/pages/search/index' });
  };

  const handleLoadMore = () => {
    if (hasMore) setPage((p) => p + 1);
  };

  const handleMapToggle = () => {
    setShowMap(!showMap);
  };

  const handleCompleteChallenge = () => {
    completeDailyChallenge();
    forceUpdate();
    Taro.showToast({ title: '挑战完成！+30经验', icon: 'none' });
  };

  const getPolylineColor = (level: string) => {
    if (level === 'green') return '#00b42a';
    if (level === 'yellow') return '#ff7d00';
    return '#f53f3f';
  };

  const getMarkerAlpha = (routeId: string) => {
    return exploredRoutes.includes(routeId) ? 1 : 0.4;
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.searchBar} onClick={handleSearchClick}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchPlaceholder}>搜索路线、区域...</Text>
        </View>
        <View className={styles.headerInfo}>
          <View>
            <Text className={styles.headerTitle}>安心跑</Text>
            <Text className={styles.headerDesc}>夜跑路线安全评分，让每一步都安心</Text>
          </View>
          <View className={styles.mapToggle} onClick={handleMapToggle}>
            <Text className={styles.mapToggleText}>{showMap ? '列表' : '地图'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.adventureSection}>
        <View className={styles.adventureLeft}>
          <Text className={styles.adventureTitle}>🏃 跑步大冒险</Text>
          <Text className={styles.adventureDesc}>已探索 {explorationProgress}% 的路线</Text>
        </View>
        <ProgressRing percent={explorationProgress} size={64} strokeWidth={5} />
      </View>

      <View className={styles.challengeSection}>
        <ChallengeCard challenge={dailyChallenge} onComplete={handleCompleteChallenge} />
      </View>

      <View className={styles.filterSection}>
        <ScrollView scrollX className={styles.filterScroll}>
          {FILTER_OPTIONS.map((opt) => (
            <View
              key={opt.key}
              className={classnames(styles.filterItem, {
                [styles.filterItemActive]: activeFilter === opt.key,
              })}
              onClick={() => handleFilterChange(opt.key)}
            >
              <Text
                className={classnames(styles.filterText, {
                  [styles.filterTextActive]: activeFilter === opt.key,
                })}
              >
                {opt.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {showMap ? (
        <View className={styles.listSection}>
          <View className={styles.mapWrap}>
            <Map
              className={styles.mapContainer}
              latitude={30.27}
              longitude={120.15}
              scale={11}
              polyline={routes
                .filter((r) => exploredRoutes.includes(r.id))
                .map((route) => ({
                  points: route.path.map((p) => ({ latitude: p.lat, longitude: p.lng })),
                  color: getPolylineColor(route.level),
                  width: 4,
                  dottedLine: false,
                }))}
              markers={routes.map((route) => ({
                id: parseInt(route.id.replace('r', '')),
                latitude: route.path[0].lat,
                longitude: route.path[0].lng,
                alpha: getMarkerAlpha(route.id),
                title: route.name,
                iconPath: '',
                callout: {
                  content: exploredRoutes.includes(route.id)
                    ? `${route.name} ★${route.overallScore}`
                    : '???',
                  display: 'ALWAYS',
                  color: '#1d2129',
                  fontSize: 12,
                  borderRadius: 8,
                  bgColor: '#ffffff',
                  padding: 6,
                },
              } as any))}
              onError={() => {}}
            />
            {!exploredRoutes.length && (
              <View className={styles.fogOverlay}>
                <Text className={styles.fogText}>🌫️ 探索路线来驱散迷雾</Text>
              </View>
            )}
          </View>
          <View className={styles.exploreInfo}>
            <Text className={styles.exploreText}>已探索 {exploredRoutes.length}/{routes.length} 条路线</Text>
          </View>
        </View>
      ) : (
        <View className={styles.listSection}>
          <ScrollView scrollY style={{ height: 'calc(100vh - 680rpx)' }} onScrollToLower={handleLoadMore}>
            {displayRoutes.map((route) => (
              <RouteCard key={route.id} route={route} onClick={handleRouteClick} />
            ))}
            {hasMore && (
              <View className={styles.loadMore}>
                <Text className={styles.loadMoreText}>上拉加载更多</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default HomePage;
