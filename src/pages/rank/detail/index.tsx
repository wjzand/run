import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { getExpRecord, getExplorationProgress, getEarnedBadges, getFoundEggs } from '@/utils/storage';
import { LEVEL_CONFIG, getLevelName, getLevelIcon, getExpForNextLevel, EXP_REWARDS } from '@/data/levels';
import BADGES from '@/data/badges';
import EASTER_EGGS from '@/data/eastereggs';
import routes from '@/data/routes';
import ProgressRing from '@/components/ProgressRing';
import styles from './index.module.scss';

const RankDetailPage: React.FC = () => {
  const expRecord = useMemo(() => getExpRecord(), []);
  const expInfo = useMemo(() => getExpForNextLevel(expRecord.total), [expRecord]);
  const explorationProgress = useMemo(() => getExplorationProgress(), []);
  const earnedBadges = useMemo(() => getEarnedBadges(), []);
  const foundEggs = useMemo(() => getFoundEggs(), []);

  return (
    <View className={styles.container}>
      <View className={styles.heroSection}>
        <Text className={styles.heroIcon}>{getLevelIcon(expRecord.level)}</Text>
        <Text className={styles.heroLevel}>Lv.{expRecord.level}</Text>
        <Text className={styles.heroName}>{getLevelName(expRecord.level)}</Text>
        <View className={styles.heroProgress}>
          <ProgressRing percent={Math.round(expInfo.progress * 100)} size={100} strokeWidth={8} />
          <View className={styles.expInfo}>
            <Text className={styles.expCurrent}>{expRecord.total}</Text>
            <Text className={styles.expNeeded}>/ {expInfo.needed} EXP</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>冒险数据</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statsCell}>
            <Text className={styles.statsValue}>{explorationProgress}%</Text>
            <Text className={styles.statsLabel}>探索进度</Text>
          </View>
          <View className={styles.statsCell}>
            <Text className={styles.statsValue}>{earnedBadges.length}/{BADGES.length}</Text>
            <Text className={styles.statsLabel}>勋章</Text>
          </View>
          <View className={styles.statsCell}>
            <Text className={styles.statsValue}>{foundEggs.length}/{EASTER_EGGS.length}</Text>
            <Text className={styles.statsLabel}>彩蛋</Text>
          </View>
          <View className={styles.statsCell}>
            <Text className={styles.statsValue}>{expRecord.streak}天</Text>
            <Text className={styles.statsLabel}>连续挑战</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>等级体系</Text>
        {LEVEL_CONFIG.map((cfg) => {
          const isCurrent = cfg.level === expRecord.level;
          const isUnlocked = expRecord.total >= cfg.minExp;
          return (
            <View className={`${styles.levelRow} ${isCurrent ? styles.levelRowCurrent : ''} ${!isUnlocked ? styles.levelRowLocked : ''}`} key={cfg.level}>
              <Text className={styles.levelIcon}>{isUnlocked ? cfg.icon : '🔒'}</Text>
              <View className={styles.levelInfo}>
                <Text className={styles.levelText}>Lv.{cfg.level} {cfg.name}</Text>
                <Text className={styles.levelExp}>{cfg.minExp} EXP</Text>
              </View>
              {isCurrent && <Text className={styles.currentTag}>当前</Text>}
            </View>
          );
        })}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>经验值获取</Text>
        <View className={styles.expList}>
          {Object.entries(EXP_REWARDS).map(([key, val]) => {
            const labels: Record<string, string> = {
              browseRoute: '浏览路线详情',
              favoriteRoute: '收藏路线',
              writeReview: '发表评论',
              unlockRoute: '解锁新路线',
              findEgg: '发现彩蛋',
              completeChallenge: '完成每日挑战',
              earnBadge: '获得勋章',
            };
            return (
              <View className={styles.expRow} key={key}>
                <Text className={styles.expLabel}>{labels[key] || key}</Text>
                <Text className={styles.expVal}>+{val}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default RankDetailPage;
