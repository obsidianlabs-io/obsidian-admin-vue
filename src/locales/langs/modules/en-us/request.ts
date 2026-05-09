const requestSection: App.I18n.Schema['request'] = {
  logout: 'Logout user after request failed',
  logoutMsg: 'User status is invalid, please log in again',
  logoutWithModal: 'Pop up modal after request failed and then log out user',
  logoutWithModalMsg: 'User status is invalid, please log in again',
  refreshToken: 'The requested token has expired, refresh the token',
  tokenExpired: 'The requested token has expired',
  networkError: 'Network connection is unavailable. Please check your network and try again.',
  timeout: 'The request timed out. Please try again later.',
  serviceUnavailable: 'The service is temporarily unavailable. Please try again later.'
};

export default requestSection;
