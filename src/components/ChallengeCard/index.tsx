import React, { memo } from 'react';
import { View, Text } from '@tarojs/components';
import type { DailyChallenge } from '@/types';
import styles from './index.module.scss';

interface ChallengeCardProps {
  challenge: DailyChallenge;
  onComplete: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  explore: '🗺️',
  badge: '🏅',
  area: '📍',
  egg: '🥚',
};

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onComplete }) => {
  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.icon}>{TYPE_ICONS[challenge.type] || '🎯'}</Text>
        <View className={styles.info}>
          <Text className={styles.title}>{challenge.title}</Text>
          <Text className={styles.desc}>{challenge.desc}</Text>
        </View>
        <Text className={styles.exp}>+{challenge.exp}</Text>
      </View>
      {challenge.completed ? (
        <View className={styles.completedBtn}>
          <Text className={styles.completedText}>✓ 已完成</Text>
        </View>
      ) : (
        <View className={styles.actionBtn} onClick={onComplete}>
          <Text className={styles.actionText}>完成挑战</Text>
        </View>
      )}
    </View>
  );
};

export default memo(ChallengeCard);
