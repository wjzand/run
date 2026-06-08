import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Input, ScrollView, Slider } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import RouteCard from '@/components/RouteCard';
import routes from '@/data/routes';
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '@/utils/storage';
import styles from './index.module.scss';

const AREAS = ['全部', '滨江区', '西湖区', '萧山区', '余杭区', '拱墅区', '上城区', '钱塘区', '临平区'];
const LEVEL_OPTIONS = [
  { key: 'green', label: '安全' },
  { key: 'yellow', label: '一般' },
  { key: 'red', label: '需注意' },
];

const SearchPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedArea, setSelectedArea] = useState('全部');
  const [minScore, setMinScore] = useState(0);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);
  const [historyKeywords, setHistoryKeywords] = useState<string[]>(getSearchHistory());

  const filteredRoutes = useMemo(() => {
    if (!searched) return [];
    return routes.filter((route) => {
      const kw = keyword.trim().toLowerCase();
      const matchKw = !kw || route.name.toLowerCase().includes(kw) || route.area.toLowerCase().includes(kw);
      const matchArea = selectedArea === '全部' || route.area === selectedArea;
      const matchScore = route.overallScore >= minScore;
      const matchLevel = selectedLevels.length === 0 || selectedLevels.includes(route.level);
      return matchKw && matchArea && matchScore && matchLevel;
    });
  }, [keyword, selectedArea, minScore, selectedLevels, searched]);

  const handleSearch = useCallback(() => {
    if (keyword.trim()) {
      addSearchHistory(keyword.trim());
      setHistoryKeywords(getSearchHistory());
    }
    setSearched(true);
  }, [keyword]);

  const handleHistoryClick = useCallback((kw: string) => {
    setKeyword(kw);
    addSearchHistory(kw);
    setHistoryKeywords(getSearchHistory());
    setSearched(true);
  }, []);

  const handleClearHistory = useCallback(() => {
    clearSearchHistory();
    setHistoryKeywords([]);
  }, []);

  const handleLevelToggle = useCallback((level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  }, []);

  const handleRouteClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${id}` });
  };

  return (
    <View className={styles.container}>
      <View className={styles.searchSection}>
        <View className={styles.searchInputWrap}>
          <Input
            className={styles.searchInput}
            placeholder='搜索路线名称或区域'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            onConfirm={handleSearch}
            confirmType='search'
          />
          <View className={styles.searchBtn} onClick={handleSearch}>
            <Text className={styles.searchBtnText}>搜索</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterTitle}>区域筛选</Text>
        <View className={styles.filterRow}>
          {AREAS.map((area) => (
            <View
              key={area}
              className={classnames(styles.filterTag, {
                [styles.filterTagActive]: selectedArea === area,
              })}
              onClick={() => setSelectedArea(area)}
            >
              <Text
                className={classnames(styles.filterTagText, {
                  [styles.filterTagTextActive]: selectedArea === area,
                })}
              >
                {area}
              </Text>
            </View>
          ))}
        </View>

        <Text className={styles.filterTitle}>安全等级</Text>
        <View className={styles.filterRow}>
          {LEVEL_OPTIONS.map((opt) => (
            <View
              key={opt.key}
              className={classnames(styles.filterTag, {
                [styles.filterTagActive]: selectedLevels.includes(opt.key),
              })}
              onClick={() => handleLevelToggle(opt.key)}
            >
              <Text
                className={classnames(styles.filterTagText, {
                  [styles.filterTagTextActive]: selectedLevels.includes(opt.key),
                })}
              >
                {opt.label}
              </Text>
            </View>
          ))}
        </View>

        <View className={styles.scoreFilter}>
          <Text className={styles.scoreLabel}>最低评分：</Text>
          <Text className={styles.scoreValue}>{minScore.toFixed(1)}</Text>
        </View>
        <Slider
          min={0}
          max={5}
          step={0.5}
          value={minScore}
          activeColor='#1B6B4A'
          onChanging={(e) => setMinScore(e.detail.value)}
          onChange={(e) => setMinScore(e.detail.value)}
        />
      </View>

      {!searched && historyKeywords.length > 0 && (
        <View className={styles.historySection}>
          <View className={styles.historyHeader}>
            <Text className={styles.historyTitle}>搜索历史</Text>
            <Text className={styles.historyClear} onClick={handleClearHistory}>
              清空
            </Text>
          </View>
          <View className={styles.historyTags}>
            {historyKeywords.map((kw) => (
              <View key={kw} className={styles.historyTag} onClick={() => handleHistoryClick(kw)}>
                <Text className={styles.historyTagText}>{kw}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {searched && (
        <View className={styles.resultSection}>
          <Text className={styles.resultTitle}>搜索结果 ({filteredRoutes.length})</Text>
          {filteredRoutes.length > 0 ? (
            <ScrollView scrollY style={{ height: 'calc(100vh - 800rpx)' }}>
              {filteredRoutes.map((route) => (
                <RouteCard key={route.id} route={route} onClick={handleRouteClick} />
              ))}
            </ScrollView>
          ) : (
            <View className={styles.emptyTip}>
              <Text className={styles.emptyIcon}>🔍</Text>
              <Text className={styles.emptyText}>未找到相关路线，试试其他关键词</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SearchPage;
