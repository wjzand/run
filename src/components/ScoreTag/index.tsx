import React, { memo } from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ScoreTagProps {
  level: 'green' | 'yellow' | 'red';
  size?: 'small' | 'normal';
}

const LEVEL_TEXT = { green: '安全', yellow: '一般', red: '需注意' };

const ScoreTag: React.FC<ScoreTagProps> = ({ level, size = 'normal' }) => {
  return (
    <View
      className={classnames(styles.tag, {
        [styles.green]: level === 'green',
        [styles.yellow]: level === 'yellow',
        [styles.red]: level === 'red',
        [styles.small]: size === 'small',
      })}
    >
      <Text
        className={classnames(styles.text, {
          [styles.textGreen]: level === 'green',
          [styles.textYellow]: level === 'yellow',
          [styles.textRed]: level === 'red',
        })}
      >
        {LEVEL_TEXT[level]}
      </Text>
    </View>
  );
};

export default memo(ScoreTag);
