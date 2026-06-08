import React, { useState } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import routes from '@/data/routes';
import { addMyReview } from '@/utils/storage';
import type { SecurityScores } from '@/types';
import styles from './index.module.scss';

const DIMENSIONS: { key: keyof SecurityScores; label: string }[] = [
  { key: 'lighting', label: '照明情况' },
  { key: 'crowd', label: '人流密度' },
  { key: 'roadCondition', label: '路面平整度' },
  { key: 'securityEnvironment', label: '治安环境' },
  { key: 'visibility', label: '视野开阔度' },
];

const ReviewPage: React.FC = () => {
  const [id] = useState(() => {
    const params = Taro.getCurrentInstance().router?.params;
    return params?.id || 'r001';
  });

  const route = routes.find((r) => r.id === id);
  const [scores, setScores] = useState<SecurityScores>({
    lighting: 3,
    crowd: 3,
    roadCondition: 3,
    securityEnvironment: 3,
    visibility: 3,
  });
  const [content, setContent] = useState('');

  const handleStarClick = (key: keyof SecurityScores, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    addMyReview({
      routeId: id,
      scores,
      content,
      time: new Date().toISOString().split('T')[0],
    });
    Taro.showToast({ title: '评价成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <View className={styles.container}>
      <Text className={styles.routeName}>{route?.name || '路线评价'}</Text>

      <View className={styles.dimList}>
        {DIMENSIONS.map((dim) => (
          <View className={styles.dimItem} key={dim.key}>
            <View className={styles.dimHeader}>
              <Text className={styles.dimName}>{dim.label}</Text>
              <Text className={styles.dimScoreText}>{scores[dim.key]}.0</Text>
            </View>
            <View className={styles.starsWrap}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  className={`${styles.starBtn} ${scores[dim.key] >= star ? styles.starActive : ''}`}
                  onClick={() => handleStarClick(dim.key, star)}
                >
                  ★
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.commentSection}>
        <Text className={styles.commentTitle}>文字评论（选填）</Text>
        <Textarea
          className={styles.commentInput}
          placeholder='分享你的跑步体验...'
          value={content}
          onInput={(e) => setContent(e.detail.value)}
          maxlength={200}
        />
      </View>

      <View className={styles.submitBtn} onClick={handleSubmit}>
        <Text className={styles.submitBtnText}>提交评价</Text>
      </View>
    </View>
  );
};

export default ReviewPage;
