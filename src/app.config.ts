export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/search/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/review/index',
    'pages/reviewList/index',
    'pages/favList/index',
    'pages/myReviewList/index',
    'pages/historyList/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1B6B4A',
    navigationBarTitleText: '安心跑',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#1B6B4A',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
});
