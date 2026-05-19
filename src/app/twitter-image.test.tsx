import { alt, contentType, size, default as Image } from './twitter-image';
import { GenerateImage } from './utils/og-generator';

// Mock the GenerateImage function
jest.mock('./utils/og-generator', () => ({
  GenerateImage: jest.fn(),
}));

const mockedGenerateImage = GenerateImage as jest.MockedFunction<typeof GenerateImage>;

describe('Twitter Image Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('alt', () => {
    it('should have the correct alt text', () => {
      expect(alt).toBe('QuickPic');
    });
  });

  describe('contentType', () => {
    it('should have the correct content type', () => {
      expect(contentType).toBe('image/png');
    });
  });

  describe('size', () => {
    it('should have the correct dimensions', () => {
      expect(size).toEqual({
        width: 1200,
        height: 630,
      });
    });

    it('should have the correct width', () => {
      expect(size.width).toBe(1200);
    });

    it('should have the correct height', () => {
      expect(size.height).toBe(630);
    });
  });

  describe('Image component', () => {
    it('should call GenerateImage with correct parameters', async () => {
      const mockImageData = new Uint8Array([1, 2, 3, 4, 5]);
      mockedGenerateImage.mockResolvedValue(mockImageData);

      const result = await Image();

      expect(GenerateImage).toHaveBeenCalledWith({
        title: 'QuickPic',
        description: 'Quick and free tools for pictures.',
      });
      expect(result).toBe(mockImageData);
    });

    it('should handle async execution correctly', async () => {
      const mockImageData = new Uint8Array([255, 254, 253]);
      mockedGenerateImage.mockResolvedValue(mockImageData);

      const resultPromise = Image();
      const result = await resultPromise;

      expect(result).toBe(mockImageData);
      expect(mockedGenerateImage).toHaveBeenCalledTimes(1);
    });

    it('should pass the correct title and description to GenerateImage', async () => {
      const expectedParams = {
        title: 'QuickPic',
        description: 'Quick and free tools for pictures.',
      };

      const mockImageData = new Uint8Array([]);
      mockedGenerateImage.mockResolvedValue(mockImageData);

      await Image();

      expect(GenerateImage).toHaveBeenCalledWith(expectedParams);
    });
  });
});