import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'portfolio-theme';

function resolveInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/**
 * Tema dark/light con persistencia. Dark es la identidad por defecto de la
 * marca; light queda disponible para quien lo prefiera o lo tenga como
 * preferencia de sistema.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<ThemeMode>(resolveInitialTheme());

  constructor() {
    effect(() => {
      const value = this.theme();
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value);
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, value);
      }
    });
  }

  toggle(): void {
    this.theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }
}
