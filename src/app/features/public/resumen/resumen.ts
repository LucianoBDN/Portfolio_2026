import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { ProfileStore } from '../../../core/services/profile-store.service';
import { BreadcrumbService } from '../../../core/services/breadcrumb.service';
import { Hobbies } from '../hobbies/hobbies';
import { BrandIcon } from '../../../shared/brand-icon/brand-icon';
import {
  Hobby,
  Profile,
  Project,
  Technology,
  TechnologyCategory,
} from '../../../core/models/portfolio.models';

const CATEGORY_LABELS: Record<TechnologyCategory, string> = {
  backend: 'Backend',
  frontend: 'Frontend',
  database: 'Bases de datos',
  tools: 'Herramientas',
};

const CATEGORY_ICONS: Record<TechnologyCategory, string> = {
  backend: 'ph-hard-drives',
  frontend: 'ph-layout',
  database: 'ph-database',
  tools: 'ph-wrench',
};

/** Cada dominio tiene su propio color (var(--cat-N)) para que la grilla de
 * áreas no se lea toda del mismo tono. */
const CATEGORY_COLOR_VAR: Record<TechnologyCategory, string> = {
  backend: '--cat-1',
  frontend: '--cat-2',
  database: '--cat-3',
  tools: '--cat-4',
};

const CATEGORY_ORDER: TechnologyCategory[] = ['backend', 'frontend', 'database', 'tools'];
const AREA_VISIBLE_ITEMS = 4;

interface WorkArea {
  category: TechnologyCategory;
  label: string;
  icon: string;
  colorVar: string;
  visible: Technology[];
  overflowCount: number;
}

interface QuickFact {
  icon: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [RouterLink, Hobbies, BrandIcon],
  templateUrl: './resumen.html',
  styleUrl: './resumen.scss',
})
export class Resumen implements OnInit {
  private readonly portfolioData = inject(PortfolioDataService);
  private readonly profileStore = inject(ProfileStore);
  private readonly breadcrumb = inject(BreadcrumbService);

  readonly loading = signal(true);
  readonly profile = signal<Profile | null>(null);
  readonly technologies = signal<Technology[]>([]);
  readonly projects = signal<Project[]>([]);
  readonly hobbies = signal<Hobby[]>([]);

  async ngOnInit(): Promise<void> {
    this.breadcrumb.set([]);

    const [profile, technologies, projects, hobbies] = await Promise.all([
      this.profileStore.load(),
      this.portfolioData.listTechnologies(),
      this.portfolioData.listProjects(),
      this.portfolioData.listHobbies(),
    ]);

    this.profile.set(profile);
    this.technologies.set(technologies);
    this.projects.set(projects);
    this.hobbies.set(hobbies);
    this.loading.set(false);
  }

  get workAreas(): WorkArea[] {
    return CATEGORY_ORDER.map((category) => {
      const items = this.technologies().filter((t) => t.category === category);
      return {
        category,
        label: CATEGORY_LABELS[category],
        icon: CATEGORY_ICONS[category],
        colorVar: CATEGORY_COLOR_VAR[category],
        visible: items.slice(0, AREA_VISIBLE_ITEMS),
        overflowCount: Math.max(0, items.length - AREA_VISIBLE_ITEMS),
      };
    }).filter((area) => area.visible.length > 0);
  }

  get quickFacts(): QuickFact[] {
    const p = this.profile();
    if (!p) return [];
    const facts: QuickFact[] = [];
    if (p.location) facts.push({ icon: 'ph-map-pin', label: 'Ubicación', value: p.location });
    if (p.availability)
      facts.push({ icon: 'ph-calendar-check', label: 'Disponibilidad', value: p.availability });
    if (p.languages) facts.push({ icon: 'ph-globe', label: 'Idiomas', value: p.languages });
    if (p.interests) facts.push({ icon: 'ph-lightbulb', label: 'Intereses', value: p.interests });
    return facts;
  }

  get featuredProject(): Project | null {
    return this.projects().find((p) => p.featured) ?? this.projects()[0] ?? null;
  }

  get recentProjects(): Project[] {
    const featuredId = this.featuredProject?.id;
    return this.projects()
      .filter((p) => p.id !== featuredId)
      .slice(0, 3);
  }
}
