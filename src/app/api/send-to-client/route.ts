import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Extraer información del análisis
    const { property, plans, clientEmail, brokerEmail } = data
    
    // Crear mensaje para Slack
    const slackMessage = {
      text: "🏠 Nueva Propuesta de Arriendo Enviada",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🏠 Nueva Propuesta de Arriendo"
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Propiedad:*\n${property.address}`
            },
            {
              type: "mrkdwn",
              text: `*Valor:*\n$${property.value_clp?.toLocaleString()} CLP`
            },
            {
              type: "mrkdwn",
              text: `*Cliente:*\n${clientEmail || 'No especificado'}`
            },
            {
              type: "mrkdwn",
              text: `*Corredor:*\n${brokerEmail || 'No especificado'}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Planes Propuestos:*\n${plans.map((p: any) => `• Plan ${p.id}: $${p.initial_rent_clp?.toLocaleString()} CLP/mes`).join('\n')}`
          }
        },
        {
          type: "divider"
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `📅 Fecha: ${new Date().toLocaleString('es-CL')} | ⏰ El cliente tiene 30 días para aceptar`
            }
          ]
        }
      ]
    }
    
    // Enviar a Slack si hay webhook configurado
    if (process.env.SLACK_WEBHOOK_URL) {
      const slackResponse = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage)
      })
      
      if (!slackResponse.ok) {
        console.error('Error enviando a Slack:', await slackResponse.text())
      }
    }
    
    // Aquí podrías también:
    // 1. Guardar en base de datos
    // 2. Enviar email al cliente
    // 3. Generar un link único para aceptación
    
    return NextResponse.json({ 
      success: true,
      message: 'Propuesta enviada exitosamente',
      slackNotified: !!process.env.SLACK_WEBHOOK_URL
    })
    
  } catch (error) {
    console.error('Error enviando propuesta:', error)
    return NextResponse.json(
      { error: 'Error al enviar la propuesta' },
      { status: 500 }
    )
  }
}