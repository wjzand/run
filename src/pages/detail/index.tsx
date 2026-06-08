import React, { useState, useMemo } from 'react';
import { View, Text, Map } from '@tarojs/components';
import Taro from '@tarojs/taro';
import RadarChart from '@/components/RadarChart';
import ScoreTag from '@/components/ScoreTag';
import ReviewItem from '@/components/ReviewItem';
import routes from '@/data/routes';
import { calcOverallScore, getLevel, calcAverageSecurity } from '@/utils/score';
import { isFavorite, toggleFavorite, addHistory, getMyReviews } from '@/utils/storage';
import type { Review, SecurityScores } from '@/types';
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

  React.useEffect(() => {
    addHistory(id);
  }, [id]);

  if (!route) {
    return (
      <View className={styles.container}>
        <View className={styles.section}>
          <Text>路线不存在</Text>
        </View>
      </View>
    );
  }

  const handleFavorite = () => {
    const nowFav = toggleFavorite(id);
    setFavorited(nowFav);
    Taro.showToast({ title: nowFav ? '已收藏' : '已取消收藏', icon: 'none' });
  };

  const handleWriteReview = () => {
    Taro.navigateTo({ url: `/pages/review/index?id=${id}` });
  };

  const handleViewAllReviews = () => {
    Taro.navigateTo({ url: `/pages/reviewList/index?id=${id}` });
  };

  const handleNavigate = () => {
    Taro.showToast({ title: '请使用地图App导航', icon: 'none' });
  };

  const handleShare = () => {
    Taro.showShareMenu({ withShareTicket: true });
  };

  const getDimDesc = (key: keyof SecurityScores, score: number) => {
    const idx = Math.min(Math.max(Math.round(score) - 1, 0), 4);
    return DIM_DESCRIPTIONS[key][idx];
  };

  const polylineColor = level === 'green' ? '#00b42a' : level === 'yellow' ? '#ff7d00' : '#f53f3f';

  const displayReviews = mergedReviews.slice(0, 3);

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
          polylines={[
            {
              points: route.path.map((p) => ({ latitude: p.lat, longitude: p.lng })),
              color: polylineColor,
              width: 4,
            },
          ]}
          markers={[
            {
              id: 1,
              latitude: route.path[0].lat,
              longitude: route.path[0].lng,
              title: '起点',
              callout: { content: '起点', display: 'ALWAYS', fontSize: 12, borderRadius: 6, bgColor: '#ffffff', padding: 4 },
            },
            {
              id: 2,
              latitude: route.path[route.path.length - 1].lat,
              longitude: route.path[route.path.length - 1].lng,
              title: '终点',
              callout: { content: '终点', display: 'ALWAYS', fontSize: 12, borderRadius: 6, bgColor: '#ffffff', padding: 4 },
            },
          ]}
        />
      </View>

      <View className={styles.section}>
        <View className={styles.reviewHeader}>
          <Text className={styles.sectionTitle}>用户评价 ({mergedReviews.length})</Text>
          <Text className={styles.reviewAllBtn} onClick={handleViewAllReviews}>
            查看全部 ›
          </Text>
        </View>
        {displayReviews.length > 0 ? (
          displayReviews.map((rev) => <ReviewItem key={rev.id} review={rev} />)
        ) : (
          <Text style={{ fontSize: '24rpx', color: '#86909c' }}>暂无评价</Text>
        )}
        <View className={styles.writeReviewBtn} onClick={handleWriteReview}>
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
        <View className={styles.navBtn} onClick={handleNavigate}>
          <Text className={styles.navBtnText}>开始导航</Text>
        </View>
        <View className={styles.shareBtn} onClick={handleShare}>
          <Text className={styles.shareIcon}>↗</Text>
          <Text className={styles.shareLabel}>分享</Text>
        </View>
      </View>
    </View>
  );
};

export default DetailPage;
