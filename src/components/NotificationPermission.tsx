"use client"

import { useState, useEffect } from 'react'
import Button from './Button'

export default function NotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      
      // Show prompt after 5 seconds if not decided
      if (Notification.permission === 'default') {
        setTimeout(() => setShowPrompt(true), 5000)
      }
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications')
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setShowPrompt(false)

      if (result === 'granted') {
        // Subscribe to push notifications
        await subscribeToPush()
        
        // Show test notification
        new Notification('WealthWise Notifications Enabled!', {
          body: 'You will now receive budget alerts and reminders',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
        })
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      
      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription()
      
      if (!subscription) {
        // Public VAPID key (you'll need to generate this)
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })

        // Send subscription to server
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
    }
  }

  if (!showPrompt || permission !== 'default') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-lg shadow-lg border border-purple-200 p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="text-3xl">🔔</div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">Enable Notifications</h3>
          <p className="text-sm text-gray-600 mb-3">
            Get notified about budget alerts, recurring expenses, and goal milestones
          </p>
          <div className="flex gap-2">
            <Button onClick={requestPermission} className="flex-1">
              Enable
            </Button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
