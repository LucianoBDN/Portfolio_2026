import { Component, Input } from '@angular/core';
import { Technology, TechnologyCategory } from '../../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

const CATEGORY_LABELS: Record<TechnologyCategory, string> = {
  backend: 'Backend',
  frontend: 'Frontend',
  database: 'Bases de datos',
  tools: 'Herramientas',
};

const CATEGORY_ORDER: TechnologyCategory[] = ['backend', 'frontend', 'database', 'tools'];

interface TechnologyGroup {
  category: TechnologyCategory;
  label: string;
  items: Technology[];
}

@Component({
  selector: 'app-technologies',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './technologies.html',
  styleUrl: './technologies.scss',
})
export class Technologies {
  @Input({ required: true }) technologies!: Technology[];

  get groups(): TechnologyGroup[] {
    return CATEGORY_ORDER.map((category) => ({
      category,
      label: CATEGORY_LABELS[category],
      items: this.technologies.filter((tech) => tech.category === category),
    })).filter((group) => group.items.length > 0);
  }
}
