import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  PLATFORM_ID,
  OnInit,
  inject,
  signal,
  WritableSignal,
  ChangeDetectionStrategy,
} from '@angular/core';

import { SudokuGridComponent } from '../sudoku-grid/sudoku-grid';
import { ImageUploaderComponent } from '../image-uploader/image-uploader';
import { ErrorBoundaryComponent } from '../error-boundary/error-boundary';
import { SudokuApiService, SudokuGenerationResult, SudokuGrid } from '../../services/sudoku-api';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [SudokuGridComponent, ImageUploaderComponent, ErrorBoundaryComponent],
  templateUrl: './main-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-page.scss',
})
export class MainPageComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private sudokuService = inject(SudokuApiService);
  private notificationService = inject(NotificationService);

  puzzleState: WritableSignal<SudokuGenerationResult | null> = signal(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadNewPuzzle();
    }
  }

  loadNewPuzzle(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.puzzleState.set(null);

    this.sudokuService.generateSudoku(difficulty).subscribe({
      next: (data) => {
        this.puzzleState.set(data);
        this.isLoading.set(false);
        this.notificationService.showSuccess(`New ${difficulty} puzzle generated!`);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMessage = err.message || 'Failed to generate puzzle. Please try again.';
        this.error.set(errorMessage);
        this.notificationService.showError(errorMessage);
        console.error('Failed to generate puzzle', err);
      },
    });
  }

  onPuzzleSolvedFromImage(solutionGrid: SudokuGrid): void {
    this.error.set(null);
    this.puzzleState.set({
      puzzle: solutionGrid,
      solution: solutionGrid,
      difficulty: 'custom',
    });
    this.notificationService.showSuccess('Puzzle solved from image successfully!');
  }

  onImageSolveError(errorMessage: string): void {
    this.error.set(errorMessage);
  }
}
