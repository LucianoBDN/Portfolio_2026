import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ImageCompressionService } from './image-compression.service';

const IMAGES_BUCKET = 'portfolio-images';
const FILES_BUCKET = 'portfolio-files';

@Injectable({ providedIn: 'root' })
export class StorageService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly imageCompression: ImageCompressionService,
  ) {}

  /**
   * Comprime la imagen a WebP (<100KB) y la sube a Supabase Storage.
   * Devuelve la URL pública del archivo subido.
   */
  async uploadImage(file: File, folder: string): Promise<string> {
    const compressed = await this.imageCompression.compressToWebp(file);
    const path = `${folder}/${crypto.randomUUID()}.webp`;

    const { error } = await this.supabase.client.storage
      .from(IMAGES_BUCKET)
      .upload(path, compressed, { contentType: 'image/webp', upsert: false });

    if (error) {
      throw error;
    }

    const { data } = this.supabase.client.storage.from(IMAGES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteImage(publicUrl: string): Promise<void> {
    await this.deleteFromBucket(IMAGES_BUCKET, publicUrl);
  }

  /** Sube un PDF (CV o certificado) sin recomprimir. Máx. 5MB (impuesto por el bucket). */
  async uploadPdf(file: File, folder: string): Promise<string> {
    const path = `${folder}/${crypto.randomUUID()}.pdf`;

    const { error } = await this.supabase.client.storage
      .from(FILES_BUCKET)
      .upload(path, file, { contentType: 'application/pdf', upsert: false });

    if (error) {
      throw error;
    }

    const { data } = this.supabase.client.storage.from(FILES_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async deletePdf(publicUrl: string): Promise<void> {
    await this.deleteFromBucket(FILES_BUCKET, publicUrl);
  }

  private async deleteFromBucket(bucket: string, publicUrl: string): Promise<void> {
    const marker = `/object/public/${bucket}/`;
    const index = publicUrl.indexOf(marker);
    if (index === -1) return;

    const path = publicUrl.slice(index + marker.length);
    await this.supabase.client.storage.from(bucket).remove([path]);
  }
}
