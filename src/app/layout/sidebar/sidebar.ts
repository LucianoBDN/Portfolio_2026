import { Component, HostListener, Input, signal } from '@angular/core';
import { Profile } from '../../core/models/portfolio.models';

interface NavLink {
  id: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input({ required: true }) profile!: Profile;

  readonly navLinks: NavLink[] = [
    { id: 'hero', label: 'Inicio' },
    { id: 'about', label: 'Sobre mí' },
    { id: 'technologies', label: 'Tecnologías' },
    { id: 'projects', label: 'Proyectos' },
    { id: 'experience', label: 'Experiencia' },
    { id: 'education', label: 'Estudios' },
    { id: 'hobbies', label: 'Hobbies' },
    { id: 'contact', label: 'Contacto' },
  ];

  readonly activeSection = signal('hero');
  readonly menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.scrollY + window.innerHeight * 0.3;
    for (const link of this.navLinks) {
      const el = document.getElementById(link.id);
      if (!el) continue;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      if (scrollPosition >= top && scrollPosition < bottom) {
        this.activeSection.set(link.id);
        break;
      }
    }
  }

  navigate(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
