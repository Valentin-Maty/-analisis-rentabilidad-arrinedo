import { NextRequest, NextResponse } from 'next/server';
import { SavedAnalysis, SavedAnalysisFormData, formDataToSavedAnalysis } from '@/types/saved-analysis';
import { getAnalysisById, saveAnalysis, deleteAnalysis, updateAnalysis } from '@/lib/analysisStore';
import { validateId, validateRentalAnalysis } from '@/lib/validation';
import { handleApiError } from '@/lib/errorHandler';

// GET - Obtener un análisis específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validar ID
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: 'ID inválido', details: idValidation.errors },
        { status: 400 }
      );
    }

    const analysis = getAnalysisById(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    return handleApiError(error, `GET /api/analyses/${params?.id}`, 'Error al obtener análisis');
  }
}

// PUT - Actualizar un análisis existente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validar ID
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: 'ID inválido', details: idValidation.errors },
        { status: 400 }
      );
    }

    // Validar datos del análisis
    const validation = validateRentalAnalysis(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Datos de análisis inválidos', details: validation.errors },
        { status: 400 }
      );
    }

    const formData: SavedAnalysisFormData = body;

    // Validaciones adicionales
    if (!formData.title || formData.title.trim().length < 3) {
      return NextResponse.json(
        { error: 'El título debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    const existingAnalysis = getAnalysisById(id);

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    // Convertir datos del formulario a análisis guardado
    const updatedAnalysisData = formDataToSavedAnalysis(formData, existingAnalysis.calculations);

    // Actualizar análisis manteniendo algunos metadatos
    const updatedAnalysis: SavedAnalysis = {
      id: existingAnalysis.id,
      ...updatedAnalysisData,
      metadata: {
        ...existingAnalysis.metadata,
        updated_at: new Date().toISOString(),
        broker_email: formData.broker_email || existingAnalysis.metadata.broker_email,
        tags: formData.tags || existingAnalysis.metadata.tags,
        notes: formData.notes !== undefined ? formData.notes : existingAnalysis.metadata.notes,
      },
    };

    // Guardar la actualización
    saveAnalysis(updatedAnalysis);

    return NextResponse.json({
      success: true,
      analysis: updatedAnalysis,
      message: 'Análisis actualizado exitosamente'
    });
  } catch (error) {
    return handleApiError(error, `PUT /api/analyses/${params?.id}`, 'Error al actualizar análisis');
  }
}

// DELETE - Eliminar un análisis
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validar ID
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: 'ID inválido', details: idValidation.errors },
        { status: 400 }
      );
    }

    const analysis = getAnalysisById(id);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos (en una app real, verificar que el broker sea el propietario)
    // Opcional: verificar que el análisis no esté en un estado que impida eliminarlo
    if (analysis.metadata.status === 'published') {
      return NextResponse.json(
        { error: 'No se puede eliminar un análisis publicado. Primero archívalo.' },
        { status: 403 }
      );
    }

    // Eliminar análisis
    const deleted = deleteAnalysis(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Error al eliminar el análisis' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Análisis eliminado exitosamente',
      deletedAnalysis: {
        id: analysis.id,
        title: analysis.title,
        property: {
          address: analysis.property.address
        }
      }
    });
  } catch (error) {
    return handleApiError(error, `DELETE /api/analyses/${params?.id}`, 'Error al eliminar análisis');
  }
}

// PATCH - Actualizar estado o campos específicos
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validar ID
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: 'ID inválido', details: idValidation.errors },
        { status: 400 }
      );
    }

    const existingAnalysis = getAnalysisById(id);

    if (!existingAnalysis) {
      return NextResponse.json(
        { error: 'Análisis no encontrado' },
        { status: 404 }
      );
    }

    // Permitir actualización de campos específicos
    const allowedUpdates = ['status', 'tags', 'notes', 'title'];
    const updates: Partial<SavedAnalysis> = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowedUpdates.includes(key)) {
        if (key === 'status' || key === 'tags' || key === 'notes') {
          updates.metadata = {
            ...existingAnalysis.metadata,
            [key]: value,
            updated_at: new Date().toISOString(),
          };
        } else if (key === 'title') {
          updates.title = value as string;
        }
      }
    }

    // Actualizar análisis
    const updatedAnalysis: SavedAnalysis = {
      ...existingAnalysis,
      ...updates,
      metadata: {
        ...existingAnalysis.metadata,
        ...updates.metadata,
        updated_at: new Date().toISOString(),
      },
    };

    saveAnalysis(updatedAnalysis);

    return NextResponse.json({
      success: true,
      analysis: updatedAnalysis,
      message: 'Análisis actualizado exitosamente'
    });
  } catch (error) {
    return handleApiError(error, `PATCH /api/analyses/${params?.id}`, 'Error al actualizar análisis');
  }
}