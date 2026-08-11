import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const CATEGORIAS = [
  'Animales de Compañía',
  'Grandes Animales',
  'Solar',
  'Instrumental',
  'Limpieza',
];

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { nombre, laboratorio } = await request.json();

    if (!nombre) {
      return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });
    }

    const prompt = `Analiza el siguiente producto y clasifícalo en UNA de estas categorías:
${CATEGORIAS.map((cat, i) => `${i + 1}. ${cat}`).join('\n')}

Producto: "${nombre}"
${laboratorio ? `Laboratorio: "${laboratorio}"` : ''}

Responde SOLO con el número de la categoría (1-5) y una breve explicación (máximo 2 líneas).
Formato: "N. Explicación"

Por ejemplo: "1. Es un producto para mascotas domésticas"`;

    const message = await client.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const response = content.text.trim();
    const match = response.match(/^(\d+)/);
    const categoryIndex = match ? parseInt(match[1]) - 1 : -1;

    if (categoryIndex < 0 || categoryIndex >= CATEGORIAS.length) {
      throw new Error('Invalid category number from Claude');
    }

    return NextResponse.json({
      categoria: CATEGORIAS[categoryIndex],
      explicacion: response.substring(response.indexOf('.') + 1).trim(),
      confianza: 'alta',
    });
  } catch (error) {
    console.error('Error clasificando producto:', error);
    return NextResponse.json(
      { error: 'Error al clasificar el producto' },
      { status: 500 }
    );
  }
}
