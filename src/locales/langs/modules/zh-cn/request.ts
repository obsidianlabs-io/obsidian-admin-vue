const requestSection: App.I18n.Schema['request'] = {
  logout: '请求失败后登出用户',
  logoutMsg: '用户状态失效，请重新登录',
  logoutWithModal: '请求失败后弹出模态框再登出用户',
  logoutWithModalMsg: '用户状态失效，请重新登录',
  refreshToken: '请求的token已过期，刷新token',
  tokenExpired: 'token已过期',
  networkError: '网络连接异常，请检查网络后重试',
  timeout: '请求超时，请稍后重试',
  serviceUnavailable: '服务暂时不可用，请稍后重试'
};

export default requestSection;
