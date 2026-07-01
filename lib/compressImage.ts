/**
 * Comprime una imagen en el navegador antes de subirla:
 * la redimensiona a un máximo de 900px y la convierte a WebP.
 * Una foto de celular de ~3 MB queda en ~50-100 KB, ahorrando
 * ancho de banda de almacenamiento y de descarga en el catálogo.
 */
export async function compressImage(file: File, maxDimension = 900, quality = 0.8): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);

    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality)
    );

    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], newName, { type: 'image/webp' });
  } catch {
    // Si algo falla (formato raro, navegador viejo), subimos la original
    return file;
  }
}
