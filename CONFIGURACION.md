# Configuración del Sistema de Análisis de Rentabilidad

## 🚀 Configuración Rápida

### 1. Variables de Entorno

El archivo `.env.local` ya está creado con las siguientes variables vacías:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Slack Webhook URL
SLACK_WEBHOOK_URL=

# URL del servidor
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Configurar Google Maps (Opcional)

Para mostrar el mapa en la dirección de la propiedad:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs y Servicios" > "Credenciales"
4. Crea una nueva API Key
5. Habilita la API "Maps Embed API"
6. Copia la API key y pégala en `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```

**Nota:** El sistema funciona perfectamente sin el mapa. Si no configuras la API key, se mostrará un placeholder con la dirección.

### 3. Configurar Slack (Opcional)

Para recibir notificaciones cuando se envíe una propuesta al cliente:

1. Ve a [Slack API](https://api.slack.com/apps)
2. Crea una nueva app
3. Ve a "Incoming Webhooks" y actívalo
4. Añade un nuevo webhook a tu workspace
5. Copia la URL del webhook y pégala en `.env.local`:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/TU_WEBHOOK_URL
   ```

**Nota:** Si no configuras Slack, el sistema seguirá funcionando pero sin notificaciones.

### 4. Reiniciar la Aplicación

Después de configurar las variables de entorno, reinicia la aplicación:

```bash
npm run dev
```

## 📝 Funcionalidades del Sistema

### Con configuración completa:
- ✅ Análisis de rentabilidad con planes A, B, C
- ✅ Cálculo de porcentajes basados en pérdida de rentabilidad mensual
- ✅ Comparación con hasta 3 propiedades similares
- ✅ Generación de PDF para firma del cliente
- ✅ Mapa interactivo de Google Maps
- ✅ Notificaciones automáticas por Slack
- ✅ Herramienta de análisis rápido de precio

### Sin configuración (funciona igual):
- ✅ Todas las funcionalidades anteriores
- ⚠️ Mapa mostrará solo la dirección (sin mapa visual)
- ⚠️ Sin notificaciones por Slack (pero el envío se registra)

## 🎯 Próximos Pasos

1. **Base de Datos**: Conectar MongoDB o PostgreSQL para guardar propuestas
2. **Emails**: Configurar SendGrid o similar para enviar PDFs por email
3. **Scraping**: Integrar scraping de Portal Inmobiliario para comparables automáticos
4. **Dashboard**: Panel de seguimiento de propuestas enviadas y aceptadas

## 🆘 Soporte

Si tienes problemas con la configuración, revisa:
- Que el archivo `.env.local` esté en la raíz del proyecto
- Que hayas reiniciado el servidor después de cambiar las variables
- Que las API keys sean válidas y tengan los permisos correctos