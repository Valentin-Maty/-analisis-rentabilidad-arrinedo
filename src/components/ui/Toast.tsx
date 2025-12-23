'use client'

import { useState, useEffect } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface ToastProps {
  message: ToastMessage
  onClose: (id: string) => void
}

function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id)
    }, message.duration || 5000)

    return () => clearTimeout(timer)
  }, [message.id, message.duration, onClose])

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  const getStyles = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className={`
      fixed top-4 right-4 z-50 w-96 max-w-sm p-4 border-2 rounded-lg shadow-lg
      transform transition-all duration-300 ease-in-out
      ${getStyles()}
    `}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <h4 className="font-bold text-sm">{message.title}</h4>
          <p className="text-sm mt-1">{message.message}</p>
        </div>
        <button
          onClick={() => onClose(message.id)}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: Date.now().toString(),
    }
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Exponer función global para mostrar toasts
  useEffect(() => {
    ;(window as any).showToast = addToast
  }, [])

  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${20 + index * 110}px` }}
          className="fixed right-4 z-50"
        >
          <Toast message={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  )
}

// Utilidades para mostrar toasts
export const toast = {
  success: (title: string, message: string, duration?: number) => {
    ;(window as any).showToast?.({
      type: 'success',
      title,
      message,
      duration,
    })
  },
  error: (title: string, message: string, duration?: number) => {
    ;(window as any).showToast?.({
      type: 'error',
      title,
      message,
      duration,
    })
  },
  warning: (title: string, message: string, duration?: number) => {
    ;(window as any).showToast?.({
      type: 'warning',
      title,
      message,
      duration,
    })
  },
  info: (title: string, message: string, duration?: number) => {
    ;(window as any).showToast?.({
      type: 'info',
      title,
      message,
      duration,
    })
  },
}