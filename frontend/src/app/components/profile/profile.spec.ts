import { beforeEach, describe, expect, it, type MockedObject, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileComponent } from './profile';
import { AuthService } from '../../services/auth.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authService: MockedObject<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = {
      fetchCurrentUser: vi.fn().mockName('AuthService.fetchCurrentUser'),
      logout: vi.fn().mockName('AuthService.logout'),
      isAuthenticated: vi.fn().mockName('AuthService.isAuthenticated'),
      currentUser: vi.fn().mockName('currentUser').mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as MockedObject<AuthService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have authService injected', () => {
    expect(component.authService).toBeTruthy();
    expect(component.authService).toBe(authService);
  });

  it('should render component without error', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
