import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { StorageService } from '../../../core/services/storage.service';
import { Project, ProjectStatus } from '../../../core/models/portfolio.models';

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos/diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function linesToArray(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-projects.html',
  styleUrl: './admin-projects.scss',
})
export class AdminProjects implements OnInit {
  readonly statuses: ProjectStatus[] = ['in_progress', 'production', 'archived'];
  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);
  readonly uploadingImage = signal(false);
  readonly imageUrl = signal<string | null>(null);
  private originalImageUrl: string | null = null;
  private slugTouched = false;

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    slug: ['', Validators.required],
    category: ['Proyecto', Validators.required],
    description: ['', Validators.required],
    tech_tags: [''],
    github_url: [''],
    demo_url: [''],
    status: ['in_progress' as ProjectStatus],
    sort_order: [0],
    featured: [false],
    context: [''],
    objective: [''],
    participation: [''],
    problem: [''],
    process: [''],
    solution: [''],
    analysis_points: [''],
    detection_points: [''],
  });

  constructor(
    private readonly portfolioData: PortfolioDataService,
    private readonly storage: StorageService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.projects.set(await this.portfolioData.listProjects());
    this.loading.set(false);
  }

  onTitleInput(): void {
    if (this.slugTouched) return;
    this.form.patchValue({ slug: slugify(this.form.controls.title.value) }, { emitEvent: false });
  }

  onSlugInput(): void {
    this.slugTouched = true;
  }

  edit(project: Project): void {
    this.editingId.set(project.id);
    this.imageUrl.set(project.image_url);
    this.originalImageUrl = project.image_url;
    this.slugTouched = true;
    this.form.patchValue({
      title: project.title,
      slug: project.slug,
      category: project.category,
      description: project.description,
      tech_tags: project.tech_tags.join(', '),
      github_url: project.github_url ?? '',
      demo_url: project.demo_url ?? '',
      status: project.status,
      sort_order: project.sort_order,
      featured: project.featured,
      context: project.context ?? '',
      objective: project.objective ?? '',
      participation: project.participation ?? '',
      problem: project.problem ?? '',
      process: project.process ?? '',
      solution: project.solution ?? '',
      analysis_points: project.analysis_points.join('\n'),
      detection_points: project.detection_points.join('\n'),
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.imageUrl.set(null);
    this.originalImageUrl = null;
    this.slugTouched = false;
    this.form.reset({
      status: 'in_progress',
      sort_order: 0,
      featured: false,
      tech_tags: '',
      category: 'Proyecto',
    });
  }

  async onImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Si ya había una imagen recién subida en esta misma edición (todavía no guardada), se descarta.
    const stagedButUnsaved = this.imageUrl();
    const shouldDiscardStaged = stagedButUnsaved && stagedButUnsaved !== this.originalImageUrl;

    this.uploadingImage.set(true);
    try {
      this.imageUrl.set(await this.storage.uploadImage(file, 'projects'));
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

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      id: this.editingId() ?? undefined,
      slug: slugify(raw.slug),
      image_url: this.imageUrl(),
      tech_tags: raw.tech_tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      context: raw.context || null,
      objective: raw.objective || null,
      participation: raw.participation || null,
      problem: raw.problem || null,
      process: raw.process || null,
      solution: raw.solution || null,
      analysis_points: linesToArray(raw.analysis_points),
      detection_points: linesToArray(raw.detection_points),
    };

    await this.portfolioData.upsertProject(payload);

    if (this.originalImageUrl && this.originalImageUrl !== payload.image_url) {
      await this.storage.deleteImage(this.originalImageUrl);
    }

    this.cancelEdit();
    await this.reload();
  }

  async remove(project: Project): Promise<void> {
    await this.portfolioData.deleteProject(project.id);
    if (project.image_url) {
      await this.storage.deleteImage(project.image_url);
    }
    await this.reload();
  }
}
