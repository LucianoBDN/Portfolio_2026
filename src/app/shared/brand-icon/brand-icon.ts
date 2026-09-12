import { Component, Input } from '@angular/core';
import { siGithub } from 'simple-icons';

/**
 * Íconos de marca reales (paths oficiales de Simple Icons) para los logos
 * fijos de la app. LinkedIn no está en el paquete (Simple Icons lo retiró
 * por un reclamo legal de la marca), así que ese sigue usando el glifo
 * genérico de Phosphor. Los logos de tecnologías (dinámicos, cargados desde
 * el admin) siguen viniendo del CDN de Simple Icons porque su slug lo
 * define el propio admin.
 */
const BRAND_ICONS = {
  github: siGithub,
} as const;

export type BrandIconName = keyof typeof BRAND_ICONS;

@Component({
  selector: 'app-brand-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path [attr.d]="path" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        line-height: 0;
      }
    `,
  ],
})
export class BrandIcon {
  @Input() size = 18;

  path = BRAND_ICONS.github.path;

  @Input({ required: true })
  set icon(value: BrandIconName) {
    this.path = BRAND_ICONS[value].path;
  }
}
