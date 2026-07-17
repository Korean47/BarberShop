const MAX_EDGE = 1600;

export async function prepareReferenceImage(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Usa una imagen JPG, PNG o WebP');
  }
  if (file.size > 12 * 1024 * 1024) throw new Error('La foto original no debe pesar más de 12 MB');

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No pudimos preparar la foto');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.78));
  if (!blob) throw new Error('No pudimos preparar la foto');
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'referencia'}.webp`, { type: 'image/webp', lastModified: Date.now() });
}
