import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { Hobby } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-admin-hobbies',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-hobbies.html',
  styleUrl: './admin-hobbies.scss',
})
export class AdminHobbies implements OnInit {
  readonly hobbies = signal<Hobby[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    emoji: ['', Validators.required],
    label: ['', Validators.required],
    sort_order: [0],
  });

  constructor(private readonly portfolioData: PortfolioDataService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.hobbies.set(await this.portfolioData.listHobbies());
    this.loading.set(false);
  }

  edit(hobby: Hobby): void {
    this.editingId.set(hobby.id);
    this.form.patchValue(hobby);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.reset({ sort_order: 0 });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { ...this.form.getRawValue(), id: this.editingId() ?? undefined };
    await this.portfolioData.upsertHobby(payload);
    this.cancelEdit();
    await this.reload();
  }

  async remove(id: string): Promise<void> {
    await this.portfolioData.deleteHobby(id);
    await this.reload();
  }
}
