import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import ReviewItem from '@/components/ReviewItem';
import routes from '@/data/routes';
import { getMyReviews } from '@/utils/storage';
import type { Review } from '@/types';
import styles from './index.module.scss';

const ReviewListPage: React.FC = () => {
  const id = Taro.getCurrentInstance().router?.params?.id || 'r001';
  const route = routes.find((r) => r.id === id);

  const allReviews: Review[] = useMemo(() => {
    const userRevs = getMyReviews()
      .filter((r) => r.routeId === id)
      .map((ur, idx) => ({
        id: `user_${idx}_${ur.routeId}`,
        user: '我',
        avatar: '',
        score: Math.round(
          (ur.scores.lighting +
            ur.scores.crowd +
            ur.scores.roadCondition +
            ur.scores.securityEnvironment +
            ur.scores.visibility) /
            5
        ),
        content: ur.content,
        time: ur.time,
      }));
    return [...userRevs, ...(route?.reviews || [])];
  }, [id, route]);

  return (
    <View className={styles.container}>
      {allReviews.length > 0 ? (
        <ScrollView scrollY style={{ height: '100vh' }}>
          <View className={styles.listWrap}>
            {allReviews.map((rev) => (
              <ReviewItem key={rev.id} review={rev} />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyIcon}>💬</Text>
          <Text className={styles.emptyText}>暂无评价</Text>
        </View>
      )}
    </View>
  );
};

export default ReviewListPage;
