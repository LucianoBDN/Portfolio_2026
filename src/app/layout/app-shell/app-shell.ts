import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProfileStore } from '../../core/services/profile-store.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { ThemeService } from '../../core/services/theme.service';
import { BrandIcon } from '../../shared/brand-icon/brand-icon';

interface NavLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, BrandIcon],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss',
})
export class AppShell implements OnInit {
  private readonly profileStore = inject(ProfileStore);
  readonly breadcrumb = inject(BreadcrumbService);
  readonly themeService = inject(ThemeService);

  readonly profile = this.profileStore.profile;
  readonly loading = this.profileStore.loading;
  readonly menuOpen = signal(false);

  readonly navLinks: NavLink[] = [
    { path: '/resumen', label: 'Resumen', icon: 'ph-house' },
    { path: '/proyectos', label: 'Proyectos', icon: 'ph-folder' },
    { path: '/experiencia', label: 'Experiencia', icon: 'ph-code' },
    { path: '/certificaciones', label: 'Certificaciones', icon: 'ph-seal-check' },
    { path: '/contacto', label: 'Contacto', icon: 'ph-envelope-simple' },
  ];

  async ngOnInit(): Promise<void> {
    await this.profileStore.load();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
