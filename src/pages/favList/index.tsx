import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import RouteCard from '@/components/RouteCard';
import routes from '@/data/routes';
import { getFavorites } from '@/utils/storage';
import styles from './index.module.scss';

const FavListPage: React.FC = () => {
  const favRoutes = useMemo(() => {
    const ids = getFavorites();
    return ids.map((id) => routes.find((r) => r.id === id)).filter(Boolean);
  }, []);

  const handleRouteClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <View className={styles.container}>
      {favRoutes.length > 0 ? (
        <ScrollView scrollY style={{ height: '100vh' }}>
          {favRoutes.map((route) => (
            <RouteCard key={route.id} route={route} onClick={handleRouteClick} />
          ))}
        </ScrollView>
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyIcon}>❤️</Text>
          <Text className={styles.emptyText}>还没有收藏路线</Text>
          <Text className={styles.emptyHint}>去发现页看看吧</Text>
        </View>
      )}
    </View>
  );
};

export default FavListPage;
