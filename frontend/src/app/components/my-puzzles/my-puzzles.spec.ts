import { beforeEach, describe, expect, it, type MockedObject, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MyPuzzlesComponent, SavedPuzzle } from './my-puzzles';
import { SudokuApiService } from '../../services/sudoku-api';
import { AuthService } from '../../services/auth.service';

describe('MyPuzzlesComponent', () => {
  let component: MyPuzzlesComponent;
  let fixture: ComponentFixture<MyPuzzlesComponent>;
  let router: MockedObject<Router>;
  // Note: These spies are created in beforeEach but may not be used in all tests

  const mockPuzzle: SavedPuzzle = {
    _id: '1',
    puzzleGrid: Array(9)
      .fill(0)
      .map(() => Array(9).fill(0)),
    solutionGrid: Array(9)
      .fill(0)
      .map(() => Array(9).fill(5)),
    difficulty: 'easy',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const sudokuServiceSpy = {
      generateSudoku: vi.fn().mockName('SudokuApiService.generateSudoku'),
    };
    const authServiceSpy = {
      currentUser: vi.fn().mockName('AuthService.currentUser'),
    };
    const routerSpy = {
      navigate: vi.fn().mockName('Router.navigate'),
    };

    await TestBed.configureTestingModule({
      imports: [MyPuzzlesComponent, HttpClientTestingModule],
      providers: [
        { provide: SudokuApiService, useValue: sudokuServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyPuzzlesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as MockedObject<Router>;
    // Note: Services are mocked and injected in beforeEach
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load puzzles on init', () => {
    vi.spyOn(component, 'loadPuzzles').mockReturnValue(undefined);

    component.ngOnInit();

    expect(component.loadPuzzles).toHaveBeenCalled();
  });

  it('should set loading state during loadPuzzles', () => {
    expect(component.isLoading).toBe(false);

    component.loadPuzzles();

    expect(component.isLoading).toBe(true);
  });

  it('should handle puzzle deletion', () => {
    component.puzzles = [mockPuzzle, { ...mockPuzzle, _id: '2' }];
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deletePuzzle('1');

    expect(component.puzzles.length).toBe(1);
    expect(component.puzzles[0]._id).toBe('2');
  });

  it('should not delete puzzle when confirmation is cancelled', () => {
    component.puzzles = [mockPuzzle];
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deletePuzzle('1');

    expect(component.puzzles.length).toBe(1);
  });

  it('should navigate to main page', () => {
    component.goToMainPage();

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should log puzzle loading', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockReturnValue(undefined);

    component.loadPuzzle(mockPuzzle);

    expect(consoleSpy).toHaveBeenCalledWith('Loading puzzle:', mockPuzzle);
  });
});
