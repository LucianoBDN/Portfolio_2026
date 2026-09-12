import { Component, OnInit, inject, signal } from '@angular/core';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { EducationCertificate } from '../../../core/models/portfolio.models';
import { Education } from '../education/education';

@Component({
  selector: 'app-certificaciones-page',
  standalone: true,
  imports: [Education],
  template: `<app-education [items]="items()" />`,
})
export class CertificacionesPage implements OnInit {
  private readonly portfolioData = inject(PortfolioDataService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly items = signal<EducationCertificate[]>([]);

  async ngOnInit(): Promise<void> {
    this.breadcrumb.set([{ label: 'Certificaciones' }]);
    this.items.set(await this.portfolioData.listEducationCertificates());
  }
}
