import { Component, Input } from '@angular/core';
import { EducationCertificate } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [],
  templateUrl: './education.html',
  styleUrl: './education.scss',
})
export class Education {
  @Input({ required: true }) items!: EducationCertificate[];

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  }
}
