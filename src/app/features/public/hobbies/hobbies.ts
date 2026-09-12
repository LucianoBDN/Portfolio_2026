import { Component, Input } from '@angular/core';
import { Hobby } from '../../../core/models/portfolio.models';

const COLOR_VARS = ['--cat-1', '--cat-2', '--cat-3', '--cat-4', '--cat-5', '--cat-6'];

@Component({
  selector: 'app-hobbies',
  standalone: true,
  imports: [],
  templateUrl: './hobbies.html',
  styleUrl: './hobbies.scss',
})
export class Hobbies {
  @Input({ required: true }) hobbies!: Hobby[];

  /** Cada tarjeta usa un color distinto (rotando la paleta) para que la
   * grilla no se vea toda del mismo tono. */
  colorVar(index: number): string {
    return COLOR_VARS[index % COLOR_VARS.length];
  }
}
