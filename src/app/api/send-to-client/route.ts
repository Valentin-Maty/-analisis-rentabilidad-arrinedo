import { NextResponse } from 'next/server'
import { validateClient, validateProperty } from '@/lib/validation'
import { handleApiError } from '@/lib/errorHandler'

interface PlanData {
  id: string
  initial_rent_clp: number
  name?: string
  commission_percentage?: number
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Validar datos requeridos
    if (!data.property || !data.plans || !Array.isArray(data.plans)) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos: property, plans' },
        { status: 400 }
      )
    }

    // Validar propiedad
    const propertyValidation = validateProperty(data.property)
    if (!propertyValidation.isValid) {
      return NextResponse.json(
        { error: 'Datos de propiedad inválidos', details: propertyValidation.errors },
        { status: 400 }
      )
    }

    // Validar emails si se proporcionan
    if (data.clientEmail) {
      const clientValidation = validateClient({ email: data.clientEmail, name: 'Cliente' })
      if (!clientValidation.isValid) {
        return NextResponse.json(
          { error: 'Email del cliente inválido', details: clientValidation.errors },
          { status: 400 }
        )
      }
    }

    if (data.brokerEmail) {
      const brokerValidation = validateClient({ email: data.brokerEmail, name: 'Corredor' })
      if (!brokerValidation.isValid) {
        return NextResponse.json(
          { error: 'Email del corredor inválido', details: brokerValidation.errors },
          { status: 400 }
        )
      }
    }

    // Validar planes
    if (data.plans.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un plan' },
        { status: 400 }
      )
    }

    for (const plan of data.plans) {
      if (!plan.id || !plan.initial_rent_clp || typeof plan.initial_rent_clp !== 'number') {
        return NextResponse.json(
          { error: 'Planes inválidos: cada plan debe tener id e initial_rent_clp' },
          { status: 400 }
        )
      }
    }
    
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
              text: `*Valor:*\n$${property.value_clp?.toLocaleString('es-CL')} CLP`
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
            text: `*Planes Propuestos:*\n${plans.map((p: PlanData) => `• Plan ${p.id}: $${p.initial_rent_clp?.toLocaleString('es-CL')} CLP/mes`).join('\n')}`
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
    return handleApiError(error, 'POST /api/send-to-client', 'Error al enviar propuesta')
  }
}