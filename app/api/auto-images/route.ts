import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const UNSPLASH_API_KEY = process.env.NEXT_PUBLIC_UNSPLASH_KEY;

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
  };
  links: {
    download_location: string;
  };
}

async function searchUnsplashImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const image: UnsplashImage = data.results[0];
      return image.urls.small;
    }
  } catch (err) {
    console.error('Error searching Unsplash:', err);
  }

  return null;
}

function extractKeywords(productName: string): string {
  const words = productName.toLowerCase().split(' ');
  const stopWords = ['de', 'del', 'la', 'el', 'y', 'o', 'a', 'en', 'x', 'inc', 'inc.', 's/clip', 'c/clip'];

  return words
    .filter((word) => word.length > 2 && !stopWords.includes(word) && !/^\d+$/.test(word))
    .slice(0, 3)
    .join(' ');
}

async function downloadAndUploadImage(imageUrl: string, productId: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const buffer = await response.arrayBuffer();
    const fileName = `productos/${productId}-${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('productos')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('productos').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.error('Error downloading/uploading image:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!UNSPLASH_API_KEY) {
      return NextResponse.json({ error: 'Unsplash API key not configured' }, { status: 500 });
    }

    const { data: productosData, error } = await supabase
      .from('productos')
      .select('id, nombre')
      .or('foto_url.is.null,foto_url.eq.""')
      .limit(50);

    if (error) {
      throw error;
    }

    const productos = productosData || [];
    const results = {
      total: productos.length,
      success: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const producto of productos) {
      try {
        const keywords = extractKeywords(producto.nombre);
        if (!keywords) {
          results.details.push({
            id: producto.id,
            nombre: producto.nombre,
            status: 'skipped',
            reason: 'No valid keywords extracted',
          });
          continue;
        }

        const imageUrl = await searchUnsplashImage(keywords);
        if (!imageUrl) {
          results.details.push({
            id: producto.id,
            nombre: producto.nombre,
            status: 'failed',
            reason: 'No image found on Unsplash',
          });
          results.failed++;
          continue;
        }

        const publicUrl = await downloadAndUploadImage(imageUrl, producto.id);
        if (!publicUrl) {
          results.details.push({
            id: producto.id,
            nombre: producto.nombre,
            status: 'failed',
            reason: 'Failed to upload image to storage',
          });
          results.failed++;
          continue;
        }

        const { error: updateError } = await supabase
          .from('productos')
          .update({ foto_url: publicUrl })
          .eq('id', producto.id);

        if (updateError) {
          results.details.push({
            id: producto.id,
            nombre: producto.nombre,
            status: 'failed',
            reason: 'Failed to update database',
          });
          results.failed++;
        } else {
          results.details.push({
            id: producto.id,
            nombre: producto.nombre,
            status: 'success',
            keywords,
          });
          results.success++;
        }
      } catch (err) {
        console.error(`Error processing producto ${producto.id}:`, err);
        results.details.push({
          id: producto.id,
          nombre: producto.nombre,
          status: 'error',
          reason: String(err),
        });
        results.failed++;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in auto-images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
