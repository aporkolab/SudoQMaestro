import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { RouterOutlet, RouterLink } from '@angular/router';
import { NotificationComponent } from './components/notification/notification';
import { ErrorBoundaryComponent } from './components/error-boundary/error-boundary';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NotificationComponent, ErrorBoundaryComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class AppComponent {
  authService = inject(AuthService);

  // Environment detection for error boundary
  isProduction =
    typeof window !== 'undefined'
      ? !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1') &&
        !window.location.hostname.includes('dev')
      : true;
}

// Export as App for main.ts compatibility
export const App = AppComponent;
