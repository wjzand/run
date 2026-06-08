import React, { memo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import type { BadgeDef, EarnedBadge } from '@/types';
import styles from './index.module.scss';

interface BadgeCardProps {
  badge: BadgeDef;
  earned?: EarnedBadge;
  onClick?: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, earned, onClick }) => {
  const isEarned = !!earned;

  return (
    <View
      className={classnames(styles.card, { [styles.cardEarned]: isEarned })}
      onClick={onClick}
    >
      <View
        className={classnames(styles.iconWrap, { [styles.iconWrapEarned]: isEarned })}
        style={isEarned ? { background: `${badge.color}20` } : {}}
      >
        <Text className={classnames(styles.icon, { [styles.iconEarned]: isEarned })}>
          {badge.icon}
        </Text>
      </View>
      <Text className={classnames(styles.name, { [styles.nameEarned]: isEarned })}>
        {badge.name}
      </Text>
      {!isEarned && (
        <Text className={styles.condition}>{badge.condition}</Text>
      )}
      {isEarned && (
        <Text className={styles.time}>{earned.time}</Text>
      )}
    </View>
  );
};

export default memo(BadgeCard);
