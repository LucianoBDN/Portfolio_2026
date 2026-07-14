import { Component, Input } from '@angular/core';
import { Project, ProjectStatus } from '../../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  production: 'En producción',
  in_progress: 'En desarrollo',
  archived: 'Archivado',
};

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  @Input({ required: true }) projects!: Project[];

  statusLabel(status: ProjectStatus): string {
    return STATUS_LABELS[status];
  }
}
