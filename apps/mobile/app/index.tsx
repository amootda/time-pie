import { useEffect, useRef, useState } from 'react'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  BackHandler,
  Platform,
  Linking,
} from 'react-native'
import { WebView, WebViewNavigation } from 'react-native-webview'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as SplashScreen from 'expo-splash-screen'
import Constants from 'expo-constants'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Web app URL - change this to your deployed URL in production
const WEB_APP_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://time-pie.vercel.app'

export default function HomeScreen() {
  const webViewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    // Handle Android back button
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (canGoBack && webViewRef.current) {
            webViewRef.current.goBack()
            return true
          }
          return false
        }
      )

      return () => backHandler.remove()
    }
  }, [canGoBack])

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack)
  }

  const handleLoadEnd = () => {
    setIsLoading(false)
    SplashScreen.hideAsync()
  }

  // Handle external links (OAuth, etc.)
  const handleShouldStartLoadWithRequest = (request: { url: string }) => {
    const { url } = request

    // Allow navigation within the app
    if (url.startsWith(WEB_APP_URL) || url.startsWith('http://localhost')) {
      return true
    }

    // Handle OAuth callbacks
    if (url.includes('timepie://')) {
      Linking.openURL(url)
      return false
    }

    // Open external links in browser
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Allow OAuth providers
      if (
        url.includes('kauth.kakao.com') ||
        url.includes('accounts.kakao.com') ||
        url.includes('supabase.co')
      ) {
        return true
      }
      Linking.openURL(url)
      return false
    }

    return true
  }

  // Inject JavaScript to communicate with web app
  const injectedJavaScript = `
    (function() {
      // Let web app know it's running in WebView
      window.isReactNativeWebView = true;
      window.ReactNativeWebView = window.ReactNativeWebView || {};

      // Add mobile-specific viewport meta
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
      document.head.appendChild(meta);

      // Disable pull-to-refresh
      document.body.style.overscrollBehavior = 'none';

      // Add status bar padding for iOS
      const statusBarHeight = ${Constants.statusBarHeight || 0};
      document.documentElement.style.setProperty('--safe-area-inset-top', statusBarHeight + 'px');

      true;
    })();
  `

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadEnd={handleLoadEnd}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsBackForwardNavigationGestures
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scalesPageToFit={false}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        cacheEnabled
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
          </View>
        )}
      />
      {isLoading && (
        <View style={styles.splashOverlay}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
})
