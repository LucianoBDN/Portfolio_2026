import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { Experience } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-admin-experience',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-experience.html',
  styleUrl: './admin-experience.scss',
})
export class AdminExperience implements OnInit {
  readonly experience = signal<Experience[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    company: ['', Validators.required],
    start_date: ['', Validators.required],
    end_date: [''],
    description: [''],
    technologies: [''],
    sort_order: [0],
  });

  constructor(private readonly portfolioData: PortfolioDataService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.experience.set(await this.portfolioData.listExperience());
    this.loading.set(false);
  }

  edit(item: Experience): void {
    this.editingId.set(item.id);
    this.form.patchValue({
      title: item.title,
      company: item.company,
      start_date: item.start_date,
      end_date: item.end_date ?? '',
      description: item.description ?? '',
      technologies: item.technologies.join(', '),
      sort_order: item.sort_order,
    });
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ sort_order: 0, technologies: '' });
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
      end_date: raw.end_date || null,
      technologies: raw.technologies
        .split(',')
        .map((tech) => tech.trim())
        .filter(Boolean),
    };

    await this.portfolioData.upsertExperience(payload);
    this.cancelEdit();
    await this.reload();
  }

  async remove(id: string): Promise<void> {
    await this.portfolioData.deleteExperience(id);
    await this.reload();
  }
}
