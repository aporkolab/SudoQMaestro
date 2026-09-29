import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './profile.scss',
})
export class ProfileComponent {
  authService = inject(AuthService);
}
