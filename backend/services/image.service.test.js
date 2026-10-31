import { jest } from '@jest/globals';
import Jimp from 'jimp';
import Tesseract from 'tesseract.js';

import { processAndSolveImage } from './image.service.js';

describe('Image service', () => {
  afterEach(() => jest.restoreAllMocks());

  it('encodes all puzzle cells as PNG before OCR and solves the recognized grid', async () => {
    const worker = {
      setParameters: jest.fn().mockResolvedValue(undefined),
      recognize: jest.fn().mockImplementation(async buffer => {
        expect(buffer.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        return { data: { text: '' } };
      }),
      terminate: jest.fn().mockResolvedValue(undefined),
    };
    jest.spyOn(Tesseract, 'createWorker').mockResolvedValue(worker);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    const image = new Jimp(91, 91, 'white');
    image.scan(0, 0, 91, 91, function (x, y) {
      if (x % 10 === 0 || y % 10 === 0) this.setPixelColor(0x000000ff, x, y);
    });
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    const solution = await processAndSolveImage({ buffer });

    expect(worker.recognize).toHaveBeenCalledTimes(81);
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(solution).toHaveLength(9);
    expect(solution.flat().every(value => value >= 1 && value <= 9)).toBe(true);
    for (const row of solution) expect(new Set(row).size).toBe(9);
  });

  it('terminates the OCR worker when recognition fails', async () => {
    const worker = {
      setParameters: jest.fn().mockResolvedValue(undefined),
      recognize: jest.fn().mockRejectedValue(new Error('OCR failed')),
      terminate: jest.fn().mockRejectedValue(new Error('Worker cleanup failed')),
    };
    jest.spyOn(Tesseract, 'createWorker').mockResolvedValue(worker);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const image = new Jimp(91, 91, 'white');
    image.scan(0, 0, 91, 91, function (x, y) {
      if (x % 10 === 0 || y % 10 === 0) this.setPixelColor(0x000000ff, x, y);
    });
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    expect(await processAndSolveImage({ buffer })).toBeNull();
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error terminating OCR worker:', expect.any(Error));
  });
});
