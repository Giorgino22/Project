import { icons, type IconName } from './icons';

/** Returns the full <svg> markup of an icon (used by Icon.astro and by browser scripts). */
export function iconSvg(name: IconName, className = 'icon'): string {
  return `<svg class="${className}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}
