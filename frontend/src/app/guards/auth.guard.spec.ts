import { beforeEach, describe, expect, it, type MockedObject, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { firstValueFrom, isObservable, of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService, User } from '../services/auth.service';

describe('authGuard', () => {
  let authService: MockedObject<AuthService>;
  let router: MockedObject<Router>;

  const mockUser: User = {
    googleId: '12345',
    displayName: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
  };

  beforeEach(() => {
    const authServiceSpy = {
      currentUser: vi.fn().mockName('AuthService.currentUser'),
      fetchCurrentUser: vi.fn().mockName('AuthService.fetchCurrentUser'),
    };
    const routerSpy = {
      navigate: vi.fn().mockName('Router.navigate'),
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    authService = TestBed.inject(AuthService) as MockedObject<AuthService>;
    router = TestBed.inject(Router) as MockedObject<Router>;
  });

  it('should allow access when user is authenticated', () => {
    authService.currentUser.mockReturnValue(mockUser);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to home when user is not authenticated', () => {
    authService.currentUser.mockReturnValue(null);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should fetch user when currentUser is undefined and allow access', async () => {
    authService.currentUser.mockReturnValue(undefined);
    authService.fetchCurrentUser.mockReturnValue(of(mockUser));

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    if (!isObservable(result)) throw new Error('Expected an observable guard result');
    const canActivate = await firstValueFrom(result);
    expect(canActivate).toBe(true);
    expect(authService.fetchCurrentUser).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should fetch user when currentUser is undefined and redirect if no user', async () => {
    authService.currentUser.mockReturnValue(undefined);
    authService.fetchCurrentUser.mockReturnValue(of(null));

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    if (!isObservable(result)) throw new Error('Expected an observable guard result');
    const canActivate = await firstValueFrom(result);
    expect(canActivate).toBe(false);
    expect(authService.fetchCurrentUser).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
