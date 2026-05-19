import React from 'react';
import { GenerateImage } from '@/app/utils/og-generator';
import OGImage, { alt, contentType, size, runtime } from '@/app/(tools)/svg-to-png/opengraph-image';

// Mock the ImageResponse from next/og
jest.mock('next/og', () => ({
  ImageResponse: jest.fn(),
}));

// Mock the GenerateImage function
jest.mock('@/app/utils/og-generator', () => ({
  GenerateImage: jest.fn(),
}));

const mockedGenerateImage = GenerateImage as jest.MockedFunction<typeof GenerateImage>;

describe('SVG to PNG OpenGraph Image', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exports', () => {
    it('should export runtime as edge', () => {
      expect(runtime).toBe('edge');
    });

    it('should export correct alt text', () => {
      expect(alt).toBe('SVG ➡️ PNG - QuickPic');
    });

    it('should export correct content type', () => {
      expect(contentType).toBe('image/png');
    });

    it('should export correct size', () => {
      expect(size).toEqual({
        width: 1200,
        height: 630,
      });
    });
  });

  describe('Image generation', () => {
    it('should call GenerateImage with correct parameters', async () => {
      const mockImageResponse = {
        // Mock ImageResponse object
      };
      mockedGenerateImage.mockResolvedValue(mockImageResponse);

      const result = await OGImage();

      expect(mockedGenerateImage).toHaveBeenCalledWith({
        title: 'SVG ➡️ PNG',
        description: 'The only simple SVG converter.',
      });
      expect(result).toBe(mockImageResponse);
    });

    it('should handle errors properly', async () => {
      const errorMessage = 'Test error';
      mockedGenerateImage.mockRejectedValue(new Error(errorMessage));

      await expect(OGImage()).rejects.toThrow(errorMessage);
    });
  });
});