import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import ToastContainer from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Análisis de Rentabilidad - Arriendos',
  description: 'Sistema de análisis de rentabilidad para arriendos con planes A, B y C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  <h1 className="text-2xl font-bold text-gray-900">
                    TuMatch Arriendos
                  </h1>
                  <p className="text-sm text-gray-600">
                    Análisis de Rentabilidad para Arriendos
                  </p>
                </Link>
              </div>
              
              <nav className="flex items-center space-x-6">
                <Link 
                  href="/analisis-precio" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  🧮 Calculadora de Arriendo
                </Link>
                <Link 
                  href="/analyses" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  📂 Análisis Guardados
                </Link>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  📊 Dashboard
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <ToastContainer />
        <footer className="bg-gray-100 border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-600">
              © 2024 TuMatch - Sistema de Análisis de Rentabilidad para Arriendos
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}