import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import routes from '@/data/routes';
import { getMyReviews, removeMyReview } from '@/utils/storage';
import styles from './index.module.scss';

const SCORE_LABELS: Record<string, string> = {
  lighting: '照明',
  crowd: '人流',
  roadCondition: '路面',
  securityEnvironment: '治安',
  visibility: '视野',
};

const MyReviewListPage: React.FC = () => {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const myReviews = useMemo(() => getMyReviews(), []);

  const handleDelete = (routeId: string) => {
    Taro.showModal({
      title: '提示',
      content: '确定删除这条评价吗？',
      success: (res) => {
        if (res.confirm) {
          removeMyReview(routeId);
          forceUpdate();
          Taro.showToast({ title: '已删除', icon: 'none' });
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      {myReviews.length > 0 ? (
        <ScrollView scrollY style={{ height: '100vh' }}>
          {myReviews.map((rev, idx) => {
            const route = routes.find((r) => r.id === rev.routeId);
            return (
              <View className={styles.reviewCard} key={`${rev.routeId}_${idx}`}>
                <View className={styles.reviewHeader}>
                  <Text className={styles.reviewRouteName}>{route?.name || rev.routeId}</Text>
                  <Text className={styles.reviewTime}>{rev.time}</Text>
                </View>
                <View className={styles.reviewScores}>
                  {Object.entries(rev.scores).map(([key, val]) => (
                    <Text className={styles.reviewScoreItem} key={key}>
                      <Text className={styles.reviewScoreLabel}>{SCORE_LABELS[key]}</Text>{' '}
                      <Text className={styles.reviewScoreValue}>{val}</Text>
                    </Text>
                  ))}
                </View>
                {rev.content ? <Text className={styles.reviewContent}>{rev.content}</Text> : null}
                <View className={styles.reviewActions}>
                  <View className={styles.deleteBtn} onClick={() => handleDelete(rev.routeId)}>
                    <Text className={styles.deleteBtnText}>删除</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View className={styles.emptyTip}>
          <Text className={styles.emptyIcon}>⭐</Text>
          <Text className={styles.emptyText}>还没有评分记录</Text>
        </View>
      )}
    </View>
  );
};

export default MyReviewListPage;
