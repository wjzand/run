import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import useAppStore from '@/store';
import routes from '@/data/routes';
import { getLevelIcon, getLevelName, getExpForNextLevel } from '@/data/levels';
import {
  getFavorites,
  getMyReviews,
  getEarnedBadges,
  getFoundEggs,
  getExpRecord,
  getExplorationProgress,
  clearAllData,
} from '@/utils/storage';
import ProgressRing from '@/components/ProgressRing';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [tick, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  const favorites = useMemo(() => getFavorites(), [tick]);
  const myReviews = useMemo(() => getMyReviews(), [tick]);
  const earnedBadges = useMemo(() => getEarnedBadges(), [tick]);
  const foundEggs = useMemo(() => getFoundEggs(), [tick]);
  const expRecord = useMemo(() => getExpRecord(), [tick]);
  const explorationProgress = useMemo(() => getExplorationProgress(), [tick]);
  const expInfo = useMemo(() => getExpForNextLevel(expRecord.total), [tick]);

  const handleEditNick = useCallback(() => {
    Taro.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入昵称',
      content: userInfo.nickName,
      success: (res) => {
        if (res.confirm && res.content) {
          setUserInfo({ ...userInfo, nickName: res.content.trim() });
        }
      },
    });
  }, [userInfo, setUserInfo]);

  const handleClearAll = () => {
    Taro.showModal({
      title: '提示',
      content: '确定清除所有本地数据吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          clearAllData();
          forceUpdate();
          Taro.showToast({ title: '已清除', icon: 'none' });
        }
      },
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.profileSection}>
        <View className={styles.avatarWrap}>
          {userInfo.avatar ? (
            <Image className={styles.avatarImg} src={userInfo.avatar} mode='aspectFill' />
          ) : (
            <Text className={styles.avatarPlaceholder}>{getLevelIcon(expRecord.level)}</Text>
          )}
        </View>
        <View className={styles.profileInfo}>
          <Text className={styles.nickName}>{userInfo.nickName}</Text>
          <View className={styles.levelRow}>
            <Text className={styles.levelIcon}>{getLevelIcon(expRecord.level)}</Text>
            <Text className={styles.levelName}>Lv.{expRecord.level} {getLevelName(expRecord.level)}</Text>
          </View>
          <View className={styles.editNickBtn} onClick={handleEditNick}>
            <Text className={styles.editNickText}>修改昵称</Text>
          </View>
        </View>
        <ProgressRing percent={Math.round(expInfo.progress * 100)} size={72} strokeWidth={5} label='经验' />
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{favorites.length}</Text>
          <Text className={styles.statLabel}>收藏</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{earnedBadges.length}</Text>
          <Text className={styles.statLabel}>勋章</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{foundEggs.length}</Text>
          <Text className={styles.statLabel}>彩蛋</Text>
        </View>
        <View className={styles.statDivider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{explorationProgress}%</Text>
          <Text className={styles.statLabel}>探索</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/badges/wall/index' })}>
          <Text className={styles.menuIcon}>🏅</Text>
          <Text className={styles.menuText}>勋章墙</Text>
          <Text className={styles.menuBadge}>{earnedBadges.length}</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/eastereggs/list/index' })}>
          <Text className={styles.menuIcon}>🥚</Text>
          <Text className={styles.menuText}>我的发现</Text>
          <Text className={styles.menuBadge}>{foundEggs.length}</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/rank/detail/index' })}>
          <Text className={styles.menuIcon}>{getLevelIcon(expRecord.level)}</Text>
          <Text className={styles.menuText}>等级详情</Text>
          <Text className={styles.menuBadge}>Lv.{expRecord.level}</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/favList/index' })}>
          <Text className={styles.menuIcon}>❤️</Text>
          <Text className={styles.menuText}>收藏路线</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/myReviewList/index' })}>
          <Text className={styles.menuIcon}>⭐</Text>
          <Text className={styles.menuText}>我的评分</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => Taro.navigateTo({ url: '/pages/historyList/index' })}>
          <Text className={styles.menuIcon}>🕐</Text>
          <Text className={styles.menuText}>浏览历史</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={handleClearAll}>
          <Text className={styles.menuIcon}>🗑️</Text>
          <Text className={styles.menuText}>清除所有数据</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem}>
          <Text className={styles.menuIcon}>ℹ️</Text>
          <Text className={styles.menuText}>关于安心跑</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
