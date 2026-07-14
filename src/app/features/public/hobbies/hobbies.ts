import { Component, Input } from '@angular/core';
import { Hobby } from '../../../core/models/portfolio.models';
import { RevealOnScrollDirective } from '../../../shared/directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-hobbies',
  standalone: true,
  imports: [RevealOnScrollDirective],
  templateUrl: './hobbies.html',
  styleUrl: './hobbies.scss',
})
export class Hobbies {
  @Input({ required: true }) hobbies!: Hobby[];
}
