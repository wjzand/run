import React, { memo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import type { Review } from '@/types';
import styles from './index.module.scss';

interface ReviewItemProps {
  review: Review;
}

const ReviewItemComp: React.FC<ReviewItemProps> = ({ review }) => {
  const stars = '★'.repeat(review.score) + '☆'.repeat(5 - review.score);

  return (
    <View className={styles.item}>
      <View className={styles.header}>
        <Image
          className={styles.avatar}
          src={review.avatar || 'https://picsum.photos/id/64/200/200'}
          mode='aspectFill'
        />
        <View className={styles.userInfo}>
          <Text className={styles.userName}>{review.user}</Text>
          <Text className={styles.time}>{review.time}</Text>
        </View>
        <Text className={styles.stars}>{stars}</Text>
      </View>
      <Text className={styles.content}>{review.content}</Text>
    </View>
  );
};

export default memo(ReviewItemComp);
