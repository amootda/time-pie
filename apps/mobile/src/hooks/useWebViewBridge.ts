import { useCallback } from 'react'
import type { WebView } from 'react-native-webview'

interface WebViewMessage {
  type: string
  payload?: unknown
}

export function useWebViewBridge(webViewRef: React.RefObject<WebView>) {
  // Send message to web app
  const sendMessage = useCallback(
    (type: string, payload?: unknown) => {
      if (webViewRef.current) {
        const message: WebViewMessage = { type, payload }
        webViewRef.current.postMessage(JSON.stringify(message))
      }
    },
    [webViewRef]
  )

  // Handle message from web app
  const handleMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    try {
      const message: WebViewMessage = JSON.parse(event.nativeEvent.data)

      switch (message.type) {
        case 'NAVIGATE':
          // Handle navigation requests
          console.log('Navigate to:', message.payload)
          break
        case 'SHARE':
          // Handle share requests
          console.log('Share:', message.payload)
          break
        case 'HAPTIC':
          // Handle haptic feedback requests
          console.log('Haptic:', message.payload)
          break
        default:
          console.log('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error)
    }
  }, [])

  // Notify web app that native app is ready
  const notifyReady = useCallback(() => {
    sendMessage('NATIVE_READY', { platform: 'react-native' })
  }, [sendMessage])

  return {
    sendMessage,
    handleMessage,
    notifyReady,
  }
}
