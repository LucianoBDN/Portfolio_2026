import { Injectable } from '@angular/core';

const MAX_BYTES = 450 * 1024;
const MAX_DIMENSION = 2200;

@Injectable({ providedIn: 'root' })
export class ImageCompressionService {
  /**
   * Recomprime cualquier imagen a WebP, bajando calidad y, si hace falta,
   * resolución hasta quedar por debajo de MAX_BYTES. Como el sitio maneja
   * pocas imágenes, priorizamos nitidez sobre peso mínimo: arranca en alta
   * calidad y solo cede lo justo para no pixelarse.
   */
  async compressToWebp(file: File): Promise<File> {
    const bitmap = await createImageBitmap(file);
    let { width, height } = this.scaleDimensions(bitmap.width, bitmap.height, MAX_DIMENSION);

    let quality = 0.92;
    let blob = await this.renderToWebp(bitmap, width, height, quality);

    while (blob.size > MAX_BYTES && quality > 0.6) {
      quality -= 0.05;
      blob = await this.renderToWebp(bitmap, width, height, quality);
    }

    while (blob.size > MAX_BYTES && width > 800) {
      width = Math.round(width * 0.9);
      height = Math.round(height * 0.9);
      blob = await this.renderToWebp(bitmap, width, height, quality);
    }

    const name = file.name.replace(/\.[^.]+$/, '') + '.webp';
    return new File([blob], name, { type: 'image/webp' });
  }

  private scaleDimensions(width: number, height: number, maxDimension: number) {
    if (width <= maxDimension && height <= maxDimension) {
      return { width, height };
    }
    const ratio = width > height ? maxDimension / width : maxDimension / height;
    return { width: Math.round(width * ratio), height: Math.round(height * ratio) };
  }

  private renderToWebp(
    bitmap: ImageBitmap,
    width: number,
    height: number,
    quality: number,
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto 2D del canvas');
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar el WebP'))),
        'image/webp',
        quality,
      );
    });
  }
}
