import type { Metadata } from 'next'
import './globals.css'

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
                <h1 className="text-2xl font-bold text-gray-900">
                  TuMatch Arriendos
                </h1>
                <p className="text-sm text-gray-600">
                  Análisis de Rentabilidad para Arriendos
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Sistema de Planes A, B y C
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
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