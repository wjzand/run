import React, { memo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { RouteItem } from '@/types';
import { getLevelText } from '@/utils/score';
import styles from './index.module.scss';

interface RouteCardProps {
  route: RouteItem;
  onClick: (id: string) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onClick }) => {
  return (
    <View className={styles.card} onClick={() => onClick(route.id)}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.name}>{route.name}</Text>
          <View
            className={classnames(styles.levelTag, {
              [styles.levelGreen]: route.level === 'green',
              [styles.levelYellow]: route.level === 'yellow',
              [styles.levelRed]: route.level === 'red',
            })}
          >
            <Text
              className={classnames(styles.levelText, {
                [styles.levelTextGreen]: route.level === 'green',
                [styles.levelTextYellow]: route.level === 'yellow',
                [styles.levelTextRed]: route.level === 'red',
              })}
            >
              {getLevelText(route.level)}
            </Text>
          </View>
        </View>
        <Text className={styles.area}>{route.area}</Text>
      </View>
      <View className={styles.scoreRow}>
        <Text className={styles.starIcon}>★</Text>
        <Text className={styles.scoreNum}>{route.overallScore}</Text>
        <Text className={styles.scoreLabel}>综合评分</Text>
      </View>
      <View className={styles.infoRow}>
        <View className={styles.infoItem}>
          <Text className={styles.infoValue}>{route.distance}km</Text>
          <Text className={styles.infoLabel}>距离</Text>
        </View>
        <View className={styles.infoDivider} />
        <View className={styles.infoItem}>
          <Text className={styles.infoValue}>{route.duration}min</Text>
          <Text className={styles.infoLabel}>时长</Text>
        </View>
        <View className={styles.infoDivider} />
        <View className={styles.infoItem}>
          <Text className={styles.infoValue}>{route.surface}</Text>
          <Text className={styles.infoLabel}>路面</Text>
        </View>
        <View className={styles.infoDivider} />
        <View className={styles.infoItem}>
          <Text className={styles.infoValue}>{route.hasTrack ? '有' : '无'}</Text>
          <Text className={styles.infoLabel}>跑道</Text>
        </View>
      </View>
      <Text className={styles.desc}>{route.description}</Text>
    </View>
  );
};

export default memo(RouteCard);
