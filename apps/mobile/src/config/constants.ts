import Constants from 'expo-constants'

// Web App URLs
export const WEB_APP_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://time-pie-web.vercel.app'

// Deep link scheme
export const DEEP_LINK_SCHEME = 'timepie'

// App info
export const APP_VERSION = Constants.expoConfig?.version || '1.0.0'

// Colors matching web app
export const COLORS = {
  primary: '#FF6B35',
  secondary: '#4A90D9',
  success: '#2ECC71',
  background: '#F8F9FA',
  text: '#2D3436',
  white: '#FFFFFF',
} as const
