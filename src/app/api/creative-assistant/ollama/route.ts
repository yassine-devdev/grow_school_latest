import { NextRequest, NextResponse } from 'next/server';
import { CreativeAssistantService } from '../../../../backend/services/creativeAssistantService';

const creativeAssistant = new CreativeAssistantService();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'test':
        // Test Ollama connection
        const connectionTest = await creativeAssistant.testConnection();
        return NextResponse.json(connectionTest);

      case 'models':
        // Get available models
        const modelsTest = await creativeAssistant.testConnection();
        return NextResponse.json({
          models: modelsTest.models,
          currentModel: creativeAssistant.getCurrentModel()
        });

      case 'current-model':
        // Get current model
        return NextResponse.json({
          currentModel: creativeAssistant.getCurrentModel()
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Ollama API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, model } = body;

    switch (action) {
      case 'set-model':
        if (!model) {
          return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
        }
        
        // Test if the model is available first
        const connectionTest = await creativeAssistant.testConnection();
        if (!connectionTest.connected) {
          return NextResponse.json({ 
            error: 'Cannot connect to Ollama',
            details: connectionTest.error
          }, { status: 503 });
        }

        if (!connectionTest.models.includes(model)) {
          return NextResponse.json({ 
            error: 'Model not found',
            availableModels: connectionTest.models
          }, { status: 404 });
        }

        creativeAssistant.setModel(model);
        return NextResponse.json({ 
          success: true,
          currentModel: model
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Ollama API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}