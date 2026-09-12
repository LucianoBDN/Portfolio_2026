import { Component, OnInit, inject, signal } from '@angular/core';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { Experience as ExperienceEntry } from '../../../core/models/portfolio.models';
import { Experience } from '../experience/experience';

@Component({
  selector: 'app-experiencia-page',
  standalone: true,
  imports: [Experience],
  template: `<app-experience [experience]="experience()" />`,
})
export class ExperienciaPage implements OnInit {
  private readonly portfolioData = inject(PortfolioDataService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly experience = signal<ExperienceEntry[]>([]);

  async ngOnInit(): Promise<void> {
    this.breadcrumb.set([{ label: 'Experiencia' }]);
    this.experience.set(await this.portfolioData.listExperience());
  }
}
