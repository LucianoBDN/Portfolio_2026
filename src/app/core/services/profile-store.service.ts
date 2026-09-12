import { Injectable, inject, signal } from '@angular/core';
import { PortfolioDataService } from './portfolio-data.service';
import { Profile } from '../models/portfolio.models';

/**
 * Carga el perfil una sola vez y lo comparte entre el shell (sidebar) y las
 * páginas públicas, para no repetir el fetch en cada ruta.
 */
@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly portfolioData = inject(PortfolioDataService);

  readonly profile = signal<Profile | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  private loadPromise: Promise<Profile> | null = null;

  /** Devuelve el perfil ya cacheado, o lo carga si es la primera vez. */
  load(): Promise<Profile> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.portfolioData
      .getProfile()
      .then((profile) => {
        this.profile.set(profile);
        return profile;
      })
      .catch((err) => {
        this.error.set(true);
        throw err;
      })
      .finally(() => this.loading.set(false));

    return this.loadPromise;
  }
}
