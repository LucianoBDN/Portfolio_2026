import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { StorageService } from '../../../core/services/storage.service';
import { EducationCertificate, EducationType } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-admin-education',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-education.html',
  styleUrl: './admin-education.scss',
})
export class AdminEducation implements OnInit {
  readonly types: EducationType[] = ['education', 'certificate'];
  readonly items = signal<EducationCertificate[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);
  readonly uploadingFile = signal(false);
  readonly uploadingImage = signal(false);
  readonly certificateUrl = signal<string | null>(null);
  readonly imageUrl = signal<string | null>(null);
  private originalCertificateUrl: string | null = null;
  private originalImageUrl: string | null = null;

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    type: ['education' as EducationType, Validators.required],
    title: ['', Validators.required],
    institution: ['', Validators.required],
    date: ['', Validators.required],
    sort_order: [0],
  });

  constructor(
    private readonly portfolioData: PortfolioDataService,
    private readonly storage: StorageService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.items.set(await this.portfolioData.listEducationCertificates());
    this.loading.set(false);
  }

  edit(item: EducationCertificate): void {
    this.editingId.set(item.id);
    this.certificateUrl.set(item.certificate_url);
    this.originalCertificateUrl = item.certificate_url;
    this.imageUrl.set(item.image_url);
    this.originalImageUrl = item.image_url;
    this.form.patchValue({ ...item });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.certificateUrl.set(null);
    this.originalCertificateUrl = null;
    this.imageUrl.set(null);
    this.originalImageUrl = null;
    this.form.reset({ type: 'education', sort_order: 0 });
  }

  async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Si ya había un archivo recién subido en esta misma edición (todavía no guardado), se descarta.
    const stagedButUnsaved = this.certificateUrl();
    const shouldDiscardStaged = stagedButUnsaved && stagedButUnsaved !== this.originalCertificateUrl;

    this.uploadingFile.set(true);
    try {
      this.certificateUrl.set(await this.storage.uploadPdf(file, 'certificates'));
      if (shouldDiscardStaged) {
        await this.storage.deletePdf(stagedButUnsaved);
      }
    } finally {
      this.uploadingFile.set(false);
    }
  }

  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const stagedButUnsaved = this.imageUrl();
    const shouldDiscardStaged = stagedButUnsaved && stagedButUnsaved !== this.originalImageUrl;

    this.uploadingImage.set(true);
    try {
      this.imageUrl.set(await this.storage.uploadImage(file, 'certificates'));
      if (shouldDiscardStaged) {
        await this.storage.deleteImage(stagedButUnsaved);
      }
    } finally {
      this.uploadingImage.set(false);
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.form.getRawValue(),
      id: this.editingId() ?? undefined,
      certificate_url: this.certificateUrl(),
      image_url: this.imageUrl(),
    };

    await this.portfolioData.upsertEducationCertificate(payload);

    if (this.originalCertificateUrl && this.originalCertificateUrl !== payload.certificate_url) {
      await this.storage.deletePdf(this.originalCertificateUrl);
    }
    if (this.originalImageUrl && this.originalImageUrl !== payload.image_url) {
      await this.storage.deleteImage(this.originalImageUrl);
    }

    this.cancelEdit();
    await this.reload();
  }

  async remove(item: EducationCertificate): Promise<void> {
    await this.portfolioData.deleteEducationCertificate(item.id);
    if (item.certificate_url) {
      await this.storage.deletePdf(item.certificate_url);
    }
    if (item.image_url) {
      await this.storage.deleteImage(item.image_url);
    }
    await this.reload();
  }
}
