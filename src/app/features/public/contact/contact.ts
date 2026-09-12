import { Component, Input, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Profile } from '../../../core/models/portfolio.models';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { BrandIcon } from '../../../shared/brand-icon/brand-icon';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, BrandIcon],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  @Input({ required: true }) profile!: Profile;

  readonly state = signal<SubmitState>('idle');

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  constructor(private readonly portfolioData: PortfolioDataService) {}

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.state.set('sending');
    try {
      await this.portfolioData.sendContactMessage(this.form.getRawValue());
      this.state.set('success');
      this.form.reset();
    } catch {
      this.state.set('error');
    }
  }
}
