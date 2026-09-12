import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export class AdminShell {
  readonly themeService = inject(ThemeService);

  readonly navItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/profile', label: 'Perfil / Hero / Sobre mí' },
    { path: '/admin/technologies', label: 'Tecnologías' },
    { path: '/admin/projects', label: 'Proyectos' },
    { path: '/admin/experience', label: 'Experiencia' },
    { path: '/admin/education', label: 'Estudios y Certificados' },
    { path: '/admin/hobbies', label: 'Hobbies' },
    { path: '/admin/messages', label: 'Mensajes' },
  ];

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigateByUrl('/admin/login');
  }
}
