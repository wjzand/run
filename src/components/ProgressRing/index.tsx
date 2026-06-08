import React, { memo } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ percent, size = 80, strokeWidth = 6, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <View className={styles.container}>
      <svg width={size} height={size} className={styles.svg}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='#e5e6eb'
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke='#1B6B4A'
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap='round'
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className={styles.progressCircle}
        />
      </svg>
      <View className={styles.center}>
        <Text className={styles.percent}>{percent}%</Text>
      </View>
      {label && <Text className={styles.label}>{label}</Text>}
    </View>
  );
};

export default memo(ProgressRing);
