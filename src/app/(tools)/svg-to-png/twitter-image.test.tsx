import { runtime, alt, contentType, size, default as Image } from './twitter-image';
import { GenerateImage } from '@/app/utils/og-generator';

// Mock the GenerateImage function since it's an external dependency
jest.mock('@/app/utils/og-generator', () => ({
  GenerateImage: jest.fn(),
}));

const mockedGenerateImage = GenerateImage as jest.MockedFunction<typeof GenerateImage>;

describe('Twitter Image Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should have the correct runtime export', () => {
    expect(runtime).toBe('edge');
  });

  it('should call GenerateImage with correct parameters', async () => {
    mockedGenerateImage.mockResolvedValue(null as any); // Mock to avoid actual rendering

    await Image();

    expect(mockedGenerateImage).toHaveBeenCalledWith({
      title: 'SVG ➡️ PNG',
      description: 'The only simple SVG converter.',
    });
  });

  it('should export alt text correctly', () => {
    expect(alt).toEqual('SVG ➡️ PNG - QuickPic');
  });

  it('should export content type correctly', () => {
    expect(contentType).toEqual('image/png');
  });

  it('should export correct size', () => {
    expect(size).toEqual({
      width: 1200,
      height: 630,
    });
    expect(size.width).toBe(1200);
    expect(size.height).toBe(630);
  });

  it('should handle errors gracefully if GenerateImage fails', async () => {
    const error = new Error('Failed to generate image');
    mockedGenerateImage.mockRejectedValue(error);

    await expect(Image()).rejects.toThrow(error);
  });
});