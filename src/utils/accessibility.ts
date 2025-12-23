/*
Domain: Accessibility
Responsibility: Utilidades para mejorar la accesibilidad web
Dependencies: ARIA specifications, WCAG guidelines
*/

// Generar ID único para accesibilidad
let idCounter = 0
export function generateA11yId(prefix: string = 'a11y'): string {
  idCounter += 1
  return `${prefix}-${idCounter}-${Date.now()}`
}

// Verificar si un elemento está visible para screen readers
export function isElementVisible(element: HTMLElement): boolean {
  if (!element) return false
  
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0'
}

// Manejar focus trap para modales
export function createFocusTrap(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  )
  
  if (focusableElements.length === 0) return
  
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
  
  const handleTabKeyPress = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        lastElement.focus()
        event.preventDefault()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        firstElement.focus()
        event.preventDefault()
      }
    }
  }
  
  container.addEventListener('keydown', handleTabKeyPress)
  firstElement.focus()
  
  // Función para limpiar el event listener
  return () => {
    container.removeEventListener('keydown', handleTabKeyPress)
  }
}

// Anunciar mensajes a screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.createElement('div')
  announcer.setAttribute('aria-live', priority)
  announcer.setAttribute('aria-atomic', 'true')
  announcer.setAttribute('class', 'sr-only')
  announcer.textContent = message
  
  document.body.appendChild(announcer)
  
  // Remover después de un tiempo para evitar acumulación
  setTimeout(() => {
    document.body.removeChild(announcer)
  }, 1000)
}

// Detectar si el usuario prefiere reducir movimientos
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Detectar si el usuario prefiere alto contraste
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

// Validar contraste de colores (básico)
export function getContrastRatio(foreground: string, background: string): number {
  // Esta es una implementación simplificada
  // En producción se debería usar una biblioteca como 'color-contrast'
  const getLuminance = (color: string): number => {
    // Convertir color hex a RGB y calcular luminancia
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// Verificar si el contraste cumple con WCAG
export function meetsWCAGContrast(
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  textSize: 'normal' | 'large' = 'normal'
): boolean {
  const ratio = getContrastRatio(foreground, background)
  
  if (level === 'AAA') {
    return textSize === 'large' ? ratio >= 4.5 : ratio >= 7
  } else {
    return textSize === 'large' ? ratio >= 3 : ratio >= 4.5
  }
}

// Tipos para props de accesibilidad comunes
export interface AriaProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'polite' | 'assertive' | 'off'
  'aria-selected'?: boolean
  'aria-checked'?: boolean | 'mixed'
  'aria-disabled'?: boolean
  'aria-required'?: boolean
  'aria-invalid'?: boolean
  'aria-busy'?: boolean
  'aria-pressed'?: boolean
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  role?: string
}

// Hook para manejar navegación con teclado
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void
) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      onEnter?.()
      event.preventDefault()
      break
    case 'Escape':
      onEscape?.()
      event.preventDefault()
      break
    case 'ArrowUp':
      onArrowUp?.()
      event.preventDefault()
      break
    case 'ArrowDown':
      onArrowDown?.()
      event.preventDefault()
      break
    case 'ArrowLeft':
      onArrowLeft?.()
      event.preventDefault()
      break
    case 'ArrowRight':
      onArrowRight?.()
      event.preventDefault()
      break
  }
}

// Utilidades para skip links
export function createSkipLink(targetId: string, text: string = 'Saltar al contenido principal') {
  const skipLink = document.createElement('a')
  skipLink.href = `#${targetId}`
  skipLink.textContent = text
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50'
  
  // Insertar al principio del body
  document.body.insertBefore(skipLink, document.body.firstChild)
  
  return skipLink
}

// Validar estructura de encabezados
export function validateHeadingStructure(): string[] {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const errors: string[] = []
  let previousLevel = 0
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1))
    
    if (index === 0 && level !== 1) {
      errors.push('La página debe comenzar con un h1')
    }
    
    if (level > previousLevel + 1) {
      errors.push(`Salto de nivel de encabezado detectado: de h${previousLevel} a h${level}`)
    }
    
    previousLevel = level
  })
  
  return errors
}

// Verificar texto alternativo de imágenes
export function validateImageAlt(): string[] {
  const images = document.querySelectorAll('img')
  const errors: string[] = []
  
  images.forEach((img, index) => {
    if (!img.hasAttribute('alt')) {
      errors.push(`Imagen ${index + 1} no tiene atributo alt`)
    } else if (img.alt.trim() === '') {
      // Alt vacío es válido para imágenes decorativas
      // pero verificar si debería tener descripción
      if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
        errors.push(`Imagen ${index + 1} tiene alt vacío pero no está marcada como decorativa`)
      }
    }
  })
  
  return errors
}

// Configuración de accesibilidad por defecto para la aplicación
export const defaultA11yProps = {
  // Para botones
  button: {
    type: 'button' as const,
    'aria-pressed': false
  },
  // Para inputs
  input: {
    'aria-required': false,
    'aria-invalid': false
  },
  // Para formularios
  form: {
    noValidate: true // Usar validación personalizada accesible
  },
  // Para enlaces
  link: {
    rel: 'noopener noreferrer'
  }
}

export default {
  generateA11yId,
  isElementVisible,
  createFocusTrap,
  announceToScreenReader,
  prefersReducedMotion,
  prefersHighContrast,
  getContrastRatio,
  meetsWCAGContrast,
  handleKeyboardNavigation,
  createSkipLink,
  validateHeadingStructure,
  validateImageAlt,
  defaultA11yProps
}