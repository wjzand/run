import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import routes from '@/data/routes';
import { getHistory, clearHistory } from '@/utils/storage';
import styles from './index.module.scss';

const HistoryListPage: React.FC = () => {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const historyRoutes = useMemo(() => {
    const ids = getHistory();
    return ids.map((id) => routes.find((r) => r.id === id)).filter(Boolean);
  }, []);

  const handleRouteClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  const handleClear = () => {
    Taro.showModal({
      title: '提示',
      content: '确定清空浏览历史吗？',
      success: (res) => {
        if (res.confirm) {
          clearHistory();
          forceUpdate();
          Taro.showToast({ title: '已清空', icon: 'none' });
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      {historyRoutes.length > 0 ? (
        <ScrollView scrollY style={{ height: '100vh' }}>
          {historyRoutes.map((route) => (
            <View className={styles.historyCard} key={route.id} onClick={() => handleRouteClick(route.id)}>
              <View className={styles.historyInfo}>
                <Text className={styles.historyName}>{route.name}</Text>
                <Text className={styles.historyArea}>{route.area}</Text>
              </View>
              <Text className={styles.historyScore}>★{route.overallScore}</Text>
            </View>
          ))}
          <View className={styles.clearBtn} onClick={handleClear}>
            <Text className={styles.clearBtnText}>清空历史</Text>
          </View>
        </ScrollView>
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyIcon}>🕐</Text>
          <Text className={styles.emptyText}>暂无浏览记录</Text>
        </View>
      )}
    </View>
  );
};

export default HistoryListPage;
