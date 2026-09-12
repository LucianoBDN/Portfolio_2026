import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { Project, ProjectStatus } from '../../../core/models/portfolio.models';
import { categoryColorVar } from '../../../shared/category-color';
import { BrandIcon } from '../../../shared/brand-icon/brand-icon';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  production: 'En producción',
  in_progress: 'En desarrollo',
  archived: 'Archivado',
};

@Component({
  selector: 'app-proyecto-detail',
  standalone: true,
  imports: [RouterLink, BrandIcon],
  templateUrl: './proyecto-detail.html',
  styleUrl: './proyecto-detail.scss',
})
export class ProyectoDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portfolioData = inject(PortfolioDataService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly project = signal<Project | null>(null);
  readonly related = signal<Project[]>([]);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(switchMap((params) => this.loadProject(params.get('slug'))))
      .subscribe();
  }

  private async loadProject(slug: string | null): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);

    if (!slug) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    try {
      const project = await this.portfolioData.getProjectBySlug(slug);
      this.project.set(project);
      this.breadcrumb.set([
        { label: 'Proyectos', link: '/proyectos' },
        { label: project.title },
      ]);
      this.related.set(await this.portfolioData.listRelatedProjects(project.category, project.id));
    } catch {
      this.notFound.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  statusLabel(status: ProjectStatus): string {
    return STATUS_LABELS[status];
  }

  categoryColor(category: string): string {
    return categoryColorVar(category);
  }
}
