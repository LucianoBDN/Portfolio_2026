import { Injectable, signal } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  link?: string;
}

/**
 * Cada página pública setea su propio breadcrumb en ngOnInit. La topbar del
 * shell solo lee `trail`. Evita acoplar el shell a las rutas hijas.
 */
@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  readonly trail = signal<BreadcrumbItem[]>([]);

  set(items: BreadcrumbItem[]): void {
    this.trail.set(items);
  }
}
