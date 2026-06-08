import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Map } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import RouteCard from '@/components/RouteCard';
import routes from '@/data/routes';
import type { SortType } from '@/types';
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
    if (hasMore) {
      setPage((p) => p + 1);
    }
  };

  const handleMapToggle = () => {
    setShowMap(!showMap);
  };

  const getPolylineColor = (level: string) => {
    if (level === 'green') return '#00b42a';
    if (level === 'yellow') return '#ff7d00';
    return '#f53f3f';
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
          <Map
            className={styles.mapContainer}
            latitude={30.27}
            longitude={120.15}
            scale={11}
            polylines={routes.map((route) => ({
              points: route.path.map((p) => ({ latitude: p.lat, longitude: p.lng })),
              color: getPolylineColor(route.level),
              width: 4,
              dottedLine: false,
            }))}
            markers={routes.map((route) => ({
              id: parseInt(route.id.replace('r', '')),
              latitude: route.path[0].lat,
              longitude: route.path[0].lng,
              title: route.name,
              callout: {
                content: `${route.name} ★${route.overallScore}`,
                display: 'ALWAYS',
                color: '#1d2129',
                fontSize: 12,
                borderRadius: 8,
                bgColor: '#ffffff',
                padding: 6,
              },
            }))}
          />
        </View>
      ) : (
        <View className={styles.listSection}>
          <ScrollView scrollY style={{ height: 'calc(100vh - 400rpx)' }} onScrollToLower={handleLoadMore}>
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
