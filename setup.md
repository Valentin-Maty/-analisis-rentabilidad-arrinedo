# Guía de Instalación - Sistema de Análisis de Rentabilidad para Arriendos

## 🚀 Instalación Rápida

### 1. Preparación del Entorno

```bash
# Verificar Node.js (debe ser 18+)
node --version

# Si no tienes Node.js, descárgalo de: https://nodejs.org/
```

### 2. Instalación de Dependencias

```bash
# Navegar al directorio del proyecto
cd "ANALISIS DE RENTABILIDAD ARRINEDO"

# Instalar dependencias
npm install

# Si prefieres usar yarn
yarn install
```

### 3. Configuración

```bash
# Copiar archivo de configuración
copy .env.example .env.local

# Editar configuraciones (opcional para desarrollo)
# notepad .env.local
```

### 4. Ejecutar la Aplicación

```bash
# Modo desarrollo
npm run dev

# La aplicación estará disponible en:
# http://localhost:3000
```

## 📱 Uso del Sistema

### Para Corredores

1. **Ir a la página principal**: `http://localhost:3000`
2. **Completar datos de la propiedad**:
   - Dirección y datos básicos
   - Precio sugerido de arriendo
   - Configuración de comisiones
   - Gastos operacionales

3. **Generar análisis**: Click en "Generar Análisis Completo"
4. **Revisar resultados**:
   - CAP Rate y métricas
   - Estudio de mercado
   - Análisis de vacancia

5. **Configurar planes**: Seleccionar planes A, B, o C
6. **Generar PDF**: Para presentar al cliente
7. **Enviar propuesta**: Generará email y link para el cliente

### Para Clientes

1. **Recibir link por email** del corredor
2. **Revisar análisis** de la propiedad
3. **Seleccionar planes** que acepta
4. **Confirmar respuesta** completando sus datos

### Dashboard de Alertas

1. **Ir al dashboard**: `http://localhost:3000/dashboard`
2. **Monitorear alertas** de ajuste de precios
3. **Aplicar reducciones** según recomendaciones del sistema

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Ejecutar en modo desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar versión de producción
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript

# Mantenimiento
npm audit            # Revisar vulnerabilidades
npm audit fix        # Corregir vulnerabilidades automáticamente
npm update           # Actualizar dependencias
```

## 🗂️ Estructura de URLs

- `/` - Página principal (análisis de propiedades)
- `/dashboard` - Dashboard de alertas y monitoreo
- `/cliente/[token]` - Página de revisión para clientes

## 💡 Tips de Uso

### Análisis de Propiedades
- Usar el botón "Sugerir Precio" para obtener un precio inicial basado en m²
- Los gastos operacionales son anuales (mantención, contribuciones, seguro)
- El valor UF se puede actualizar según cotización actual

### Configuración de Planes
- Plan A: Más servicio, más comisión, ajustes más frecuentes
- Plan B: Balance entre servicio y costo
- Plan C: Menor comisión, ajustes solo al final

### Interpretación de Métricas
- **CAP Rate > 6%**: Excelente rentabilidad
- **CAP Rate 4-6%**: Rentabilidad promedio
- **CAP Rate < 4%**: Revisar estrategia de precios

## 🚨 Solución de Problemas

### Error de Instalación
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

### Error de Puerto en Uso
```bash
# El puerto 3000 está ocupado, usar otro puerto
npm run dev -- --port 3001
```

### Error de TypeScript
```bash
# Verificar tipos
npm run type-check

# Si hay errores, revisar archivos TypeScript
```

### Error de PDF
- Verificar que jsPDF esté instalado correctamente
- Revisar consola del navegador para errores específicos

## 📞 Soporte Técnico

### Logs de Desarrollo
- Abrir DevTools del navegador (F12)
- Revisar Console para errores JavaScript
- Revisar Network para errores de API

### Archivos de Configuración
- `next.config.mjs`: Configuración de Next.js
- `tailwind.config.ts`: Configuración de estilos
- `tsconfig.json`: Configuración de TypeScript

### Contacto
Para problemas técnicos o preguntas:
- Revisar la documentación en README.md
- Consultar el código base de TuMatch
- Contactar al equipo de desarrollo

---

✅ **Sistema listo para usar después de seguir estos pasos**