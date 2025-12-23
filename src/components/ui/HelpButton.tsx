'use client'

import { useState } from 'react'

interface HelpButtonProps {
  title: string
  content: string
}

export default function HelpButton({ title, content }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-5 h-5 text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
        aria-label="Ayuda"
      >
        <span className="text-xs font-bold">?</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            </div>

            <div className="text-gray-700 text-sm leading-relaxed mb-6">
              {content}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              ✅ Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}