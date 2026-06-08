import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import BADGES from '@/data/badges';
import { getEarnedBadges } from '@/utils/storage';
import BadgeCard from '@/components/BadgeCard';
import classnames from 'classnames';
import styles from './index.module.scss';

const SERIES_TABS = [
  { key: 'all', label: '全部' },
  { key: 'safety', label: '安全认证' },
  { key: 'feature', label: '路线特色' },
  { key: 'master', label: '大师勋章' },
];

const WallPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const earnedBadges = useMemo(() => getEarnedBadges(), []);
  const earnedMap = useMemo(() => {
    const map: Record<string, typeof earnedBadges[0]> = {};
    earnedBadges.forEach((b) => { map[b.id] = b; });
    return map;
  }, [earnedBadges]);

  const filteredBadges = useMemo(() => {
    if (activeTab === 'all') return BADGES;
    return BADGES.filter((b) => b.series === activeTab);
  }, [activeTab]);

  const earnedCount = earnedBadges.length;
  const totalCount = BADGES.length;

  const handleBadgeClick = (badgeId: string) => {
    const earned = earnedMap[badgeId];
    const def = BADGES.find((b) => b.id === badgeId);
    if (!def) return;
    if (earned) {
      Taro.showModal({
        title: `${def.icon} ${def.name}`,
        content: `获得时间：${earned.time}\n获得路线：${earned.routeId || '成就解锁'}`,
        showCancel: false,
      });
    } else {
      Taro.showModal({
        title: `${def.icon} ${def.name}`,
        content: `获取条件：${def.condition}`,
        showCancel: false,
      });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.summary}>
        <Text className={styles.summaryText}>已收集 {earnedCount}/{totalCount} 枚勋章</Text>
      </View>
      <ScrollView scrollX className={styles.tabScroll}>
        {SERIES_TABS.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, { [styles.tabItemActive]: activeTab === tab.key })}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={classnames(styles.tabText, { [styles.tabTextActive]: activeTab === tab.key })}>
              {tab.label}
            </Text>
          </View>
        ))}
      </ScrollView>
      <ScrollView scrollY style={{ height: 'calc(100vh - 240rpx)' }}>
        <View className={styles.grid}>
          {filteredBadges.map((badge) => (
            <View className={styles.gridItem} key={badge.id}>
              <BadgeCard badge={badge} earned={earnedMap[badge.id]} onClick={() => handleBadgeClick(badge.id)} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default WallPage;
