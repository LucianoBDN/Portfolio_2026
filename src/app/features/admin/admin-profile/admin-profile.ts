import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.scss',
})
export class AdminProfile implements OnInit {
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploadingAvatar = signal(false);
  readonly uploadingCv = signal(false);
  readonly uploadingHeroBg = signal(false);
  readonly savedMessage = signal(false);
  readonly avatarUrl = signal<string | null>(null);
  readonly cvUrl = signal<string | null>(null);
  readonly heroBgUrl = signal<string | null>(null);

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    full_name: [''],
    role_title: [''],
    hero_greeting: [''],
    hero_role: [''],
    hero_subtitle: [''],
    hero_bg_color: ['#0f172a'],
    hero_text_color: ['#f8fafc'],
    about_text: [''],
    location: [''],
    availability: [''],
    languages: [''],
    interests: [''],
    github_url: [''],
    linkedin_url: [''],
    email: [''],
  });

  constructor(
    private readonly portfolioData: PortfolioDataService,
    private readonly storage: StorageService,
  ) {}

  async ngOnInit(): Promise<void> {
    const profile = await this.portfolioData.getProfile();
    this.form.patchValue({
      full_name: profile.full_name,
      role_title: profile.role_title,
      hero_greeting: profile.hero_greeting,
      hero_role: profile.hero_role,
      hero_subtitle: profile.hero_subtitle,
      hero_bg_color: profile.hero_bg_color ?? '#0f172a',
      hero_text_color: profile.hero_text_color ?? '#f8fafc',
      about_text: profile.about_text,
      location: profile.location ?? '',
      availability: profile.availability ?? '',
      languages: profile.languages ?? '',
      interests: profile.interests ?? '',
      github_url: profile.github_url ?? '',
      linkedin_url: profile.linkedin_url ?? '',
      email: profile.email ?? '',
    });
    this.avatarUrl.set(profile.avatar_url);
    this.cvUrl.set(profile.cv_url);
    this.heroBgUrl.set(profile.hero_bg_image_url);
    this.loading.set(false);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.savedMessage.set(false);
    await this.portfolioData.updateProfile(this.form.getRawValue());
    this.saving.set(false);
    this.savedMessage.set(true);
  }

  async onAvatarSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const previous = this.avatarUrl();
    this.uploadingAvatar.set(true);
    try {
      const url = await this.storage.uploadImage(file, 'avatar');
      await this.portfolioData.updateProfile({ avatar_url: url });
      this.avatarUrl.set(url);
      if (previous) {
        await this.storage.deleteImage(previous);
      }
    } finally {
      this.uploadingAvatar.set(false);
    }
  }

  async onCvSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const previous = this.cvUrl();
    this.uploadingCv.set(true);
    try {
      const url = await this.storage.uploadPdf(file, 'cv');
      await this.portfolioData.updateProfile({ cv_url: url });
      this.cvUrl.set(url);
      if (previous) {
        await this.storage.deletePdf(previous);
      }
    } finally {
      this.uploadingCv.set(false);
    }
  }

  async onHeroBgSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const previous = this.heroBgUrl();
    this.uploadingHeroBg.set(true);
    try {
      const url = await this.storage.uploadImage(file, 'hero-backgrounds');
      await this.portfolioData.updateProfile({ hero_bg_image_url: url });
      this.heroBgUrl.set(url);
      if (previous) {
        await this.storage.deleteImage(previous);
      }
    } finally {
      this.uploadingHeroBg.set(false);
    }
  }

  async removeHeroBg(): Promise<void> {
    const current = this.heroBgUrl();
    await this.portfolioData.updateProfile({ hero_bg_image_url: null });
    this.heroBgUrl.set(null);
    if (current) {
      await this.storage.deleteImage(current);
    }
  }
}
