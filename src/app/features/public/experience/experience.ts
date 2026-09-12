import { Component, Input } from '@angular/core';
import { Experience as ExperienceEntry } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class Experience {
  @Input({ required: true }) experience!: ExperienceEntry[];

  formatRange(item: ExperienceEntry): string {
    const start = this.formatDate(item.start_date);
    const end = item.end_date ? this.formatDate(item.end_date) : 'Actualidad';
    return `${start} - ${end}`;
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  }
}
