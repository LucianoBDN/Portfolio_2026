import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { Profile } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  @Input({ required: true }) profile!: Profile;

  get sectionStyle(): Record<string, string> {
    const style: Record<string, string> = {};

    if (this.profile.hero_bg_image_url) {
      style['background-image'] = `linear-gradient(rgba(6, 10, 20, 0.55), rgba(6, 10, 20, 0.55)), url("${this.profile.hero_bg_image_url}")`;
      style['background-size'] = 'cover';
      style['background-position'] = 'center';
    } else if (this.profile.hero_bg_color) {
      style['background-color'] = this.profile.hero_bg_color;
    }

    return style;
  }

  get textStyle(): Record<string, string> {
    return this.profile.hero_text_color ? { color: this.profile.hero_text_color } : {};
  }

  scrollToProjects(event: Event): void {
    event.preventDefault();
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
