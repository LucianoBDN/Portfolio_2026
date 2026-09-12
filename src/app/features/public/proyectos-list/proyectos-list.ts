import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { Project } from '../../../core/models/portfolio.models';
import { categoryColorVar } from '../../../shared/category-color';

@Component({
  selector: 'app-proyectos-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './proyectos-list.html',
  styleUrl: './proyectos-list.scss',
})
export class ProyectosList implements OnInit {
  private readonly portfolioData = inject(PortfolioDataService);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly loading = signal(true);
  readonly projects = signal<Project[]>([]);
  readonly search = signal('');
  readonly activeCategory = signal<string | null>(null);

  readonly categories = computed(() => {
    const set = new Set<string>();
    for (const p of this.projects()) set.add(p.category);
    return Array.from(set);
  });

  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    const category = this.activeCategory();
    return this.projects().filter((p) => {
      const matchesCategory = !category || p.category === category;
      const matchesQuery =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tech_tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  });

  async ngOnInit(): Promise<void> {
    this.breadcrumb.set([{ label: 'Proyectos' }]);
    this.projects.set(await this.portfolioData.listProjects());
    this.loading.set(false);
  }

  setCategory(category: string | null): void {
    this.activeCategory.set(category);
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  categoryColor(category: string): string {
    return categoryColorVar(category);
  }
}
