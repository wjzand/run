import React, { useEffect, useRef, memo } from 'react';
import Taro from '@tarojs/taro';
import { Canvas, View, Text } from '@tarojs/components';
import type { SecurityScores } from '@/types';
import styles from './index.module.scss';

interface RadarChartProps {
  scores: SecurityScores;
  size?: number;
}

const DIMENSIONS = [
  { key: 'lighting' as const, label: '照明' },
  { key: 'crowd' as const, label: '人流' },
  { key: 'roadCondition' as const, label: '路面' },
  { key: 'securityEnvironment' as const, label: '治安' },
  { key: 'visibility' as const, label: '视野' },
];

function drawRadar(ctx: any, scores: SecurityScores, size: number, dpr: number) {
  const centerX = (size / 2) * dpr;
  const centerY = (size / 2) * dpr;
  const maxRadius = (size / 2 - 40) * dpr;
  const levels = 5;
  const sides = 5;
  const angleStep = (Math.PI * 2) / sides;
  const startAngle = -Math.PI / 2;

  ctx.clearRect(0, 0, size * dpr, size * dpr);

  for (let l = 1; l <= levels; l++) {
    const r = (maxRadius * l) / levels;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = '#e5e6eb';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
  }

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + maxRadius * Math.cos(angle), centerY + maxRadius * Math.sin(angle));
    ctx.strokeStyle = '#e5e6eb';
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();
  }

  const values = DIMENSIONS.map((d) => scores[d.key] / 5);
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    const r = maxRadius * values[i];
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(27, 107, 74, 0.25)';
  ctx.fill();
  ctx.strokeStyle = '#1B6B4A';
  ctx.lineWidth = 2 * dpr;
  ctx.stroke();

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    const r = maxRadius * values[i];
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 3 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = '#1B6B4A';
    ctx.fill();
  }

  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    const labelR = maxRadius + 20 * dpr;
    const x = centerX + labelR * Math.cos(angle);
    const y = centerY + labelR * Math.sin(angle);
    ctx.font = `${11 * dpr}px PingFang SC, sans-serif`;
    ctx.fillStyle = '#4e5969';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(DIMENSIONS[i].label, x, y);
  }
}

const RadarChart: React.FC<RadarChartProps> = ({ scores, size = 300 }) => {
  const canvasId = useRef(`radar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      const query = Taro.createSelectorQuery();
      query
        .select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0]) return;
          const canvas = res[0].node;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          const dpr = Taro.getSystemInfoSync().pixelRatio;
          canvas.width = size * dpr;
          canvas.height = size * dpr;
          ctx.scale(1, 1);
          drawRadar(ctx, scores, size, dpr);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [scores, size, canvasId]);

  return (
    <View className={styles.container}>
      <Canvas
        id={canvasId}
        type='2d'
        className={styles.canvas}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      <View className={styles.legend}>
        {DIMENSIONS.map((d) => (
          <View className={styles.legendItem} key={d.key}>
            <Text className={styles.legendLabel}>{d.label}</Text>
            <Text className={styles.legendScore}>{scores[d.key]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default memo(RadarChart);
