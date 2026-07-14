import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { Technology, TechnologyCategory } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-admin-technologies',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-technologies.html',
  styleUrl: './admin-technologies.scss',
})
export class AdminTechnologies implements OnInit {
  readonly categories: TechnologyCategory[] = ['backend', 'frontend', 'database', 'tools'];
  readonly technologies = signal<Technology[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    category: ['backend' as TechnologyCategory, Validators.required],
    name: ['', Validators.required],
    icon_slug: ['', Validators.required],
    sort_order: [0],
  });

  constructor(private readonly portfolioData: PortfolioDataService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.technologies.set(await this.portfolioData.listTechnologies());
    this.loading.set(false);
  }

  edit(tech: Technology): void {
    this.editingId.set(tech.id);
    this.form.patchValue(tech);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ category: 'backend', name: '', icon_slug: '', sort_order: 0 });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { ...this.form.getRawValue(), id: this.editingId() ?? undefined };
    await this.portfolioData.upsertTechnology(payload);
    this.cancelEdit();
    await this.reload();
  }

  async remove(id: string): Promise<void> {
    await this.portfolioData.deleteTechnology(id);
    await this.reload();
  }
}
