/**
 * Platform detection utilities for WebView integration
 */

declare global {
  interface Window {
    isReactNativeWebView?: boolean
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}

/**
 * Check if running inside React Native WebView
 */
export function isWebView(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(window.isReactNativeWebView || window.ReactNativeWebView)
}

/**
 * Send message to React Native app
 */
export function sendToNative(type: string, payload?: unknown): void {
  if (typeof window === 'undefined') return

  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }))
  }
}

/**
 * Get platform type
 */
export function getPlatform(): 'web' | 'webview' | 'server' {
  if (typeof window === 'undefined') return 'server'
  return isWebView() ? 'webview' : 'web'
}
