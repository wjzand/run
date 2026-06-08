import React, { memo } from 'react';
import { View, Text } from '@tarojs/components';
import type { EasterEggDef } from '@/types';
import styles from './index.module.scss';

interface EggPopupProps {
  egg: EasterEggDef;
  visible: boolean;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  trivia: '冷知识',
  slogan: '神秘留言',
  history: '历史趣闻',
};

const EggPopup: React.FC<EggPopupProps> = ({ egg, visible, onClose }) => {
  if (!visible) return null;

  return (
    <View className={styles.overlay} onClick={onClose}>
      <View className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <Text className={styles.sparkle}>{'\u2728'}</Text>
        <Text className={styles.title}>你发现了一个彩蛋！</Text>
        <View className={styles.typeTag}>
          <Text className={styles.typeText}>{TYPE_LABELS[egg.type] || '彩蛋'}</Text>
        </View>
        <Text className={styles.eggIcon}>{egg.icon}</Text>
        <Text className={styles.eggTitle}>{egg.title}</Text>
        <Text className={styles.eggContent}>{egg.content}</Text>
        <View className={styles.closeBtn} onClick={onClose}>
          <Text className={styles.closeText}>收下彩蛋</Text>
        </View>
      </View>
    </View>
  );
};

export default memo(EggPopup);
