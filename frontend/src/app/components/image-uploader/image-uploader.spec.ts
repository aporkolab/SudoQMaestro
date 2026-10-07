import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ImageUploaderComponent } from './image-uploader';
import { SudokuApiService } from '../../services/sudoku-api';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ImageUploaderComponent', () => {
  let component: ImageUploaderComponent;
  let fixture: ComponentFixture<ImageUploaderComponent>;
  let sudokuApiService: SudokuApiService;

  // Create a mock service
  const mockSudokuApiService = {
    solveFromImage: vi
      .fn()
      .mockName('solveFromImage')
      .mockReturnValue(of({ solution: [[1]] })),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageUploaderComponent, HttpClientTestingModule],
      providers: [{ provide: SudokuApiService, useValue: mockSudokuApiService }],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploaderComponent);
    component = fixture.componentInstance;
    sudokuApiService = TestBed.inject(SudokuApiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set selectedFile and previewUrl on file selection', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const mockEvent = { currentTarget: { files: [mockFile] } } as unknown as Event;

    component.onFileSelected(mockEvent);

    expect(component.selectedFile).toEqual(mockFile);
    // Cannot easily test previewUrl as it relies on FileReader which is async
  });

  it('should call solveFromImage and emit onSolveSuccess on successful upload', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const mockSolution = [[9]];
    mockSudokuApiService.solveFromImage.mockReturnValue(of({ solution: mockSolution }));
    vi.spyOn(component.solveSuccess, 'emit').mockReturnValue(undefined);

    component.selectedFile = mockFile;
    component.onUpload();

    expect(sudokuApiService.solveFromImage).toHaveBeenCalledWith(mockFile);
    expect(component.solveSuccess.emit).toHaveBeenCalledWith(mockSolution);
    expect(component.isLoading).toBe(false);
  });

  it('should set error message on failed upload', () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    const errorResponse = { error: { msg: 'Test error' } };
    mockSudokuApiService.solveFromImage.mockReturnValue(throwError(() => errorResponse));

    component.selectedFile = mockFile;
    component.onUpload();

    expect(sudokuApiService.solveFromImage).toHaveBeenCalledWith(mockFile);
    expect(component.error).toEqual('Test error');
    expect(component.isLoading).toBe(false);
  });
});
