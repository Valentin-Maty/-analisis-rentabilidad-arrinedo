'use client'

import { useState, useEffect, ReactNode, useRef } from 'react'
import { createFocusTrap, generateA11yId } from '@/utils/accessibility'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = useRef(generateA11yId('modal-title'))
  const contentId = useRef(generateA11yId('modal-content'))

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      
      // Configurar focus trap
      if (modalRef.current) {
        const cleanup = createFocusTrap(modalRef.current)
        return cleanup
      }
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Manejar tecla Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md'
      case 'md':
        return 'max-w-lg'
      case 'lg':
        return 'max-w-2xl'
      case 'xl':
        return 'max-w-4xl'
      default:
        return 'max-w-lg'
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId.current}
      aria-describedby={contentId.current}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          ref={modalRef}
          className={`
            relative w-full ${getSizeClasses()} bg-white rounded-lg shadow-xl 
            transform transition-all duration-300 focus:outline-none
          `}
          tabIndex={-1}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 
              id={titleId.current}
              className="text-lg font-bold text-gray-900"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Cerrar modal"
              type="button"
            >
              ×
            </button>
          </div>
          
          {/* Content */}
          <div 
            id={contentId.current}
            className="p-6"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info'
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️'
      case 'warning':
        return '🔶'
      case 'info':
        return 'ℹ️'
      default:
        return '❓'
    }
  }

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="text-center">
        <div 
          className="text-4xl mb-4" 
          role="img"
          aria-label={`Icono de ${type === 'danger' ? 'peligro' : type === 'warning' ? 'advertencia' : 'información'}`}
        >
          {getIcon()}
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex space-x-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            type="button"
            aria-describedby="cancel-description"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getConfirmButtonStyle()}`}
            type="button"
            aria-describedby="confirm-description"
            autoFocus
          >
            {confirmText}
          </button>
        </div>
        
        {/* Descripciones ocultas para screen readers */}
        <div id="cancel-description" className="sr-only">
          Cancelar la acción y cerrar el modal
        </div>
        <div id="confirm-description" className="sr-only">
          Confirmar la acción y continuar
        </div>
      </div>
    </Modal>
  )
}

// Hook para manejar modales de confirmación
export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const confirm = (
    title: string, 
    message: string, 
    type: 'danger' | 'warning' | 'info' = 'info'
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title,
        message,
        type,
        onConfirm: () => resolve(true),
      })
    })
  }

  const handleClose = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }))
  }

  const ConfirmModalComponent = () => (
    <ConfirmModal
      isOpen={confirmState.isOpen}
      onClose={handleClose}
      onConfirm={confirmState.onConfirm}
      title={confirmState.title}
      message={confirmState.message}
      type={confirmState.type}
    />
  )

  return { confirm, ConfirmModalComponent }
}