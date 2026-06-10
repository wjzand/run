import React, { useState, useMemo } from 'react';
import { View, Text, Map } from '@tarojs/components';
import Taro from '@tarojs/taro';
import RadarChart from '@/components/RadarChart';
import ScoreTag from '@/components/ScoreTag';
import ReviewItem from '@/components/ReviewItem';
import EggPopup from '@/components/EggPopup';
import routes from '@/data/routes';
import BADGES from '@/data/badges';
import EASTER_EGGS from '@/data/eastereggs';
import { EXP_REWARDS } from '@/data/levels';
import { calcOverallScore, getLevel, calcAverageSecurity } from '@/utils/score';
import {
  isFavorite,
  toggleFavorite,
  addHistory,
  getMyReviews,
  onRouteExplored,
  addExp,
  addFoundEgg,
  getFoundEggs,
  completeDailyChallenge,
  getDailyChallenge,
} from '@/utils/storage';
import type { Review, SecurityScores, EasterEggDef } from '@/types';
import styles from './index.module.scss';

const DIM_DESCRIPTIONS: Record<keyof SecurityScores, string[]> = {
  lighting: ['路灯覆盖极少，基本无照明', '路灯稀疏，部分路段黑暗', '路灯一般，少数路段较暗', '路灯覆盖较好，部分路段偏暗', '路灯充足，覆盖率高'],
  crowd: ['几乎无人经过', '人流量很少', '偶尔有人经过', '人流量适中', '人流密集，热闹'],
  roadCondition: ['路面破损严重', '路面不平整，有坑洼', '路面一般，轻微不平', '路面较平整', '路面非常平整'],
  securityEnvironment: ['治安较差，无巡逻', '治安一般，偶有巡逻', '治安尚可，定期巡逻', '治安良好，巡逻频繁', '治安优秀，全天巡逻'],
  visibility: ['视野极度受限', '视野较差，遮挡多', '视野一般', '视野较好', '视野开阔，无遮挡'],
};

const DetailPage: React.FC = () => {
  const [id] = useState(() => {
    const params = Taro.getCurrentInstance().router?.params;
    return params?.id || 'r001';
  });

  const route = useMemo(() => routes.find((r) => r.id === id), [id]);
  const userReviews = useMemo(() => getMyReviews().filter((r) => r.routeId === id), [id]);

  const mergedReviews: Review[] = useMemo(() => {
    const userRevs: Review[] = userReviews.map((ur, idx) => ({
      id: `user_${idx}_${ur.routeId}`,
      user: '我',
      avatar: '',
      score: Math.round(
        (ur.scores.lighting + ur.scores.crowd + ur.scores.roadCondition + ur.scores.securityEnvironment + ur.scores.visibility) / 5
      ),
      content: ur.content,
      time: ur.time,
      scores: ur.scores,
    }));
    return [...userRevs, ...(route?.reviews || [])];
  }, [userReviews, route]);

  const avgSecurity: SecurityScores = useMemo(() => {
    if (!route) return { lighting: 0, crowd: 0, roadCondition: 0, securityEnvironment: 0, visibility: 0 };
    const userScores = userReviews.map((ur) => ur.scores);
    return calcAverageSecurity(route.security, userScores);
  }, [route, userReviews]);

  const overallScore = useMemo(() => calcOverallScore(avgSecurity), [avgSecurity]);
  const level = useMemo(() => getLevel(overallScore), [overallScore]);
  const [favorited, setFavorited] = useState(() => isFavorite(id));

  const routeEgg = useMemo((): EasterEggDef | null => {
    const foundIds = getFoundEggs().map((e) => e.id);
    const egg = EASTER_EGGS.find((e) => e.routeId === id && !foundIds.includes(e.id));
    return egg || null;
  }, [id]);
  const [showEgg, setShowEgg] = useState(false);
  const [eggTriggered, setEggTriggered] = useState(false);

  React.useEffect(() => {
    addHistory(id);
    const result = onRouteExplored(id);
    if (result.newBadges.length > 0) {
      const badgeNames = result.newBadges.map((bid) => {
        const def = BADGES.find((b) => b.id === bid);
        return def ? def.name : bid;
      });
      setTimeout(() => {
        Taro.showToast({ title: `获得勋章：${badgeNames.join('、')}`, icon: 'none', duration: 3000 });
      }, 500);
    }
    addExp(EXP_REWARDS.browseRoute);

    const challenge = getDailyChallenge();
    if (challenge && !challenge.completed) {
      if (challenge.type === 'explore' && challenge.targetRouteId === id) {
        completeDailyChallenge();
        setTimeout(() => Taro.showToast({ title: '每日挑战完成！+30经验', icon: 'none' }), 1500);
      }
    }

    if (routeEgg && !eggTriggered) {
      const timer = setTimeout(() => {
        setShowEgg(true);
        setEggTriggered(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [id, routeEgg]);

  const handleEggClose = () => {
    if (routeEgg) {
      addFoundEgg({ id: routeEgg.id, time: new Date().toISOString().split('T')[0] });
      const challenge = getDailyChallenge();
      if (challenge && !challenge.completed && challenge.type === 'egg') {
        completeDailyChallenge();
        Taro.showToast({ title: '彩蛋猎人挑战完成！', icon: 'none' });
      }
    }
    setShowEgg(false);
  };

  if (!route) {
    return (
      <View className={styles.container}>
        <View className={styles.section}><Text>路线不存在</Text></View>
      </View>
    );
  }

  const handleFavorite = () => {
    const nowFav = toggleFavorite(id);
    setFavorited(nowFav);
    if (nowFav) addExp(EXP_REWARDS.favoriteRoute);
    Taro.showToast({ title: nowFav ? '已收藏' : '已取消收藏', icon: 'none' });
  };

  const polylineColor = level === 'green' ? '#00b42a' : level === 'yellow' ? '#ff7d00' : '#f53f3f';
  const getDimDesc = (key: keyof SecurityScores, score: number) => {
    const idx = Math.min(Math.max(Math.round(score) - 1, 0), 4);
    return DIM_DESCRIPTIONS[key][idx];
  };

  return (
    <View className={styles.container}>
      <View className={styles.heroSection}>
        <View className={styles.heroTop}>
          <View>
            <Text className={styles.heroName}>{route.name}</Text>
            <ScoreTag level={level} />
          </View>
          <View className={styles.heroScoreWrap}>
            <Text className={styles.heroScoreNum}>{overallScore}</Text>
            <Text className={styles.heroScoreMax}>/5</Text>
          </View>
        </View>
        <Text className={styles.heroDesc}>{route.description}</Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>安全评分</Text>
        <RadarChart scores={avgSecurity} size={260} />
        <View className={styles.dimList}>
          {(
            [
              { key: 'lighting', label: '照明情况' },
              { key: 'crowd', label: '人流密度' },
              { key: 'roadCondition', label: '路面平整度' },
              { key: 'securityEnvironment', label: '治安环境' },
              { key: 'visibility', label: '视野开阔度' },
            ] as const
          ).map((dim) => (
            <View key={dim.key}>
              <View className={styles.dimItem}>
                <Text className={styles.dimName}>{dim.label}</Text>
                <View className={styles.dimBarWrap}>
                  <View className={styles.dimBar} style={{ width: `${(avgSecurity[dim.key] / 5) * 100}%` }} />
                </View>
                <Text className={styles.dimScore}>{avgSecurity[dim.key]}</Text>
              </View>
              <Text className={styles.dimDesc}>
                {dim.label}{avgSecurity[dim.key]}：{getDimDesc(dim.key, avgSecurity[dim.key])}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>路线信息</Text>
        <View className={styles.infoGrid}>
          <View className={styles.infoCell}>
            <Text className={styles.infoCellLabel}>全长距离</Text>
            <Text className={styles.infoCellValue}>{route.distance} km</Text>
          </View>
          <View className={styles.infoCell}>
            <Text className={styles.infoCellLabel}>预估时长</Text>
            <Text className={styles.infoCellValue}>{route.duration} 分钟</Text>
          </View>
          <View className={styles.infoCell}>
            <Text className={styles.infoCellLabel}>路面类型</Text>
            <Text className={styles.infoCellValue}>{route.surface}</Text>
          </View>
          <View className={styles.infoCell}>
            <Text className={styles.infoCellLabel}>专用跑道</Text>
            <Text className={styles.infoCellValue}>{route.hasTrack ? '有' : '无'}</Text>
          </View>
        </View>
        <Map
          style={{ width: '100%', height: '360rpx', marginTop: '24rpx', borderRadius: '12rpx' }}
          latitude={route.path[0].lat}
          longitude={route.path[0].lng}
          scale={13}
          polyline={[{ points: route.path.map((p) => ({ latitude: p.lat, longitude: p.lng })), color: polylineColor, width: 4 }]}
          markers={[
            { id: 1, latitude: route.path[0].lat, longitude: route.path[0].lng, title: '起点', iconPath: '', callout: { content: '起点', display: 'ALWAYS', fontSize: 12, borderRadius: 6, bgColor: '#ffffff', padding: 4, color: '#333333', anchorX: 0, anchorY: 0, borderWidth: 0, borderColor: '#ffffff', textAlign: 'center' } as any },
            { id: 2, latitude: route.path[route.path.length - 1].lat, longitude: route.path[route.path.length - 1].lng, title: '终点', iconPath: '', callout: { content: '终点', display: 'ALWAYS', fontSize: 12, borderRadius: 6, bgColor: '#ffffff', padding: 4, color: '#333333', anchorX: 0, anchorY: 0, borderWidth: 0, borderColor: '#ffffff', textAlign: 'center' } as any },
          ] as any}
          onError={() => {}}
        />
      </View>

      <View className={styles.section}>
        <View className={styles.reviewHeader}>
          <Text className={styles.sectionTitle}>用户评价 ({mergedReviews.length})</Text>
          <Text className={styles.reviewAllBtn} onClick={() => Taro.navigateTo({ url: `/pages/reviewList/index?id=${id}` })}>
            查看全部 ›
          </Text>
        </View>
        {mergedReviews.slice(0, 3).map((rev) => <ReviewItem key={rev.id} review={rev} />)}
        <View className={styles.writeReviewBtn} onClick={() => Taro.navigateTo({ url: `/pages/review/index?id=${id}` })}>
          <Text className={styles.writeReviewText}>写评价</Text>
        </View>
      </View>

      <View className={styles.actionBar}>
        <View className={styles.favBtn} onClick={handleFavorite}>
          <Text className={`${styles.favIcon} ${favorited ? styles.favIconActive : styles.favIconInactive}`}>
            {favorited ? '♥' : '♡'}
          </Text>
          <Text className={styles.favLabel}>{favorited ? '已收藏' : '收藏'}</Text>
        </View>
        <View className={styles.navBtn} onClick={() => Taro.showToast({ title: '请使用地图App导航', icon: 'none' })}>
          <Text className={styles.navBtnText}>开始导航</Text>
        </View>
        <View className={styles.shareBtn} onClick={() => Taro.showShareMenu({ withShareTicket: true })}>
          <Text className={styles.shareIcon}>↗</Text>
          <Text className={styles.shareLabel}>分享</Text>
        </View>
      </View>

      {routeEgg && <EggPopup egg={routeEgg} visible={showEgg} onClose={handleEggClose} />}
    </View>
  );
};

export default DetailPage;
