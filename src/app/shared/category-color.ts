const COLOR_VARS = ['--cat-1', '--cat-2', '--cat-3', '--cat-4', '--cat-5', '--cat-6'];

/**
 * Deriva un color de categoría estable (var(--cat-N)) a partir del nombre.
 * Mismo texto → mismo color siempre, sin necesidad de mapear cada
 * categoría a mano.
 */
export function categoryColorVar(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return COLOR_VARS[hash % COLOR_VARS.length];
}
