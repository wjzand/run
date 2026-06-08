import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { getFoundEggs } from '@/utils/storage';
import EASTER_EGGS from '@/data/eastereggs';
import styles from './index.module.scss';

const TYPE_LABELS: Record<string, string> = {
  trivia: '冷知识',
  slogan: '神秘留言',
  history: '历史趣闻',
};

const EggsListPage: React.FC = () => {
  const foundEggs = useMemo(() => getFoundEggs(), []);
  const foundMap = useMemo(() => {
    const map: Record<string, string> = {};
    foundEggs.forEach((e) => { map[e.id] = e.time; });
    return map;
  }, [foundEggs]);

  return (
    <View className={styles.container}>
      <View className={styles.summary}>
        <Text className={styles.summaryText}>已发现 {foundEggs.length}/{EASTER_EGGS.length} 个彩蛋</Text>
      </View>
      <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
        {EASTER_EGGS.map((egg) => {
          const isFound = !!foundMap[egg.id];
          return (
            <View className={`${styles.eggCard} ${isFound ? '' : styles.eggLocked}`} key={egg.id}>
              <View className={styles.eggHeader}>
                <Text className={styles.eggIcon}>{isFound ? egg.icon : '❓'}</Text>
                <View className={styles.eggInfo}>
                  <Text className={styles.eggTitle}>{isFound ? egg.title : '未发现的彩蛋'}</Text>
                  <View className={styles.eggTypeTag}>
                    <Text className={styles.eggTypeText}>{TYPE_LABELS[egg.type] || '彩蛋'}</Text>
                  </View>
                </View>
                {isFound && <Text className={styles.eggTime}>{foundMap[egg.id]}</Text>}
              </View>
              {isFound && <Text className={styles.eggContent}>{egg.content}</Text>}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default EggsListPage;
