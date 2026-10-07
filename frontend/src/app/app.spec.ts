import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { App } from './app';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';

describe('App', () => {
  beforeEach(async () => {
    const mockAuthService = {
      currentUser: signal(null),
      login: vi.fn().mockName('login'),
      logout: vi.fn().mockName('logout'),
      checkAuthStatus: vi.fn().mockName('checkAuthStatus'),
    };

    const mockNotificationService = {
      message: signal(null),
      type: signal('info' as 'info' | 'success' | 'warning' | 'error'),
      show: vi.fn().mockName('show'),
      showError: vi.fn().mockName('showError'),
      showSuccess: vi.fn().mockName('showSuccess'),
      showWarning: vi.fn().mockName('showWarning'),
      clear: vi.fn().mockName('clear'),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(withXhr()),
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('SudoQMaestro');
  });
});
