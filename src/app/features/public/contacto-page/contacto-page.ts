import { Component, OnInit, inject, signal } from '@angular/core';
import { ProfileStore } from '../../../core/services/profile-store.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { Profile } from '../../../core/models/portfolio.models';
import { Contact } from '../contact/contact';

@Component({
  selector: 'app-contacto-page',
  standalone: true,
  imports: [Contact],
  template: `
    @if (profile(); as p) {
      <app-contact [profile]="p" />
    }
  `,
})
export class ContactoPage implements OnInit {
  private readonly profileStore = inject(ProfileStore);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly profile = signal<Profile | null>(null);

  async ngOnInit(): Promise<void> {
    this.breadcrumb.set([{ label: 'Contacto' }]);
    this.profile.set(await this.profileStore.load());
  }
}
