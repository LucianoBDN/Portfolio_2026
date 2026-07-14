import { Component, Input } from '@angular/core';
import { Profile } from '../../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

interface QuickFact {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  @Input({ required: true }) profile!: Profile;

  get quickFacts(): QuickFact[] {
    const facts: QuickFact[] = [];
    if (this.profile.location) facts.push({ icon: '📍', label: 'Ubicación', value: this.profile.location });
    if (this.profile.availability) facts.push({ icon: '🟢', label: 'Disponibilidad', value: this.profile.availability });
    if (this.profile.languages) facts.push({ icon: '🌐', label: 'Idiomas', value: this.profile.languages });
    if (this.profile.interests) facts.push({ icon: '💡', label: 'Intereses', value: this.profile.interests });
    return facts;
  }
}
