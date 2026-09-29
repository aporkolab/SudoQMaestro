import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Authenticated pages need the browser session, not a build-time API request.
  { path: 'my-puzzles', renderMode: RenderMode.Client },
  { path: 'profile', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];
