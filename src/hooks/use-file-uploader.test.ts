import { renderHook, act } from '@testing-library/react';
import { useFileUploader } from './use-file-uploader';

// Mock DOMParser for SVG processing
const mockParseFromString = jest.fn();
const mockGetAttribute = jest.fn();

class MockDOMParser {
  parseFromString = mockParseFromString;
}

class MockSVGElement {
  getAttribute = mockGetAttribute;
}

class MockXMLDocument {
  documentElement: MockSVGElement;

  constructor() {
    this.documentElement = new MockSVGElement();
  }
}

// Store original globals
const originalDOMParser = global.DOMParser;
const originalImage = global.Image;
const originalURL = global.URL;
const originalFileReader = global.FileReader;

describe('useFileUploader', () => {
  beforeEach(() => {
    // Mock DOMParser
    mockParseFromString.mockReturnValue(new MockXMLDocument());
    mockGetAttribute.mockImplementation((attr: string) => {
      if (attr === 'width') return '300';
      if (attr === 'height') return '150';
      return null;
    });

    (global as any).DOMParser = MockDOMParser;

    // Mock Image - trigger onload synchronously
    (global as any).Image = class MockImage {
      onload: (() => void) | null = null;
      width = 800;  // Default width
      height = 600; // Default height

      set src(value: string) {
        // Immediately trigger onload when src is set
        if (this.onload) {
          // Use setTimeout to ensure the callback runs after the setter completes
          setTimeout(() => {
            this.onload?.();
          }, 0);
        }
      }
    };

    // Mock URL
    (global as any).URL = {
      createObjectURL: jest.fn(() => 'mock-object-url'),
      revokeObjectURL: jest.fn(),
    };

    // Mock FileReader
    (global as any).FileReader = class MockFileReader {
      onload: ((event: any) => void) | null = null;
      readAsDataURL = jest.fn(function(this: any, file: File) {
        // Immediately call onload for image/png files
        if (this.onload) {
          this.onload({ target: { result: `data:${file.type};base64,abc123` } });
        }
      });
      readAsText = jest.fn(function(this: any, file: File) {
        // Immediately call onload for SVG files
        if (this.onload) {
          this.onload({ target: { result: '<svg width="400" height="200"></svg>' } });
        }
      });
    };

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original globals
    global.DOMParser = originalDOMParser;
    global.Image = originalImage;
    global.URL = originalURL;
    global.FileReader = originalFileReader;
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useFileUploader());
    
    expect(result.current.imageContent).toBe('');
    expect(result.current.rawContent).toBe('');
    expect(result.current.imageMetadata).toBeNull();
  });

  it('should handle image file upload', async () => {
    const mockFile = new File([''], 'test.png', { type: 'image/png' });
    
    const { result } = renderHook(() => useFileUploader());
    
    // Process the file upload
    await act(async () => {
      result.current.handleFileUpload(mockFile);
      // Wait for next tick to allow the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify the state has been updated
    expect(result.current.imageContent).toBe('data:image/png;base64,abc123');
    expect(result.current.rawContent).toBe('data:image/png;base64,abc123');
    expect(result.current.imageMetadata).toEqual({
      width: 800,
      height: 600,
      name: 'test.png',
    });
  });

  it('should handle SVG file upload', async () => {
    const mockFile = new File(['<svg></svg>'], 'test.svg', { type: 'image/svg+xml' });
    
    const { result } = renderHook(() => useFileUploader());
    
    await act(async () => {
      result.current.handleFileUpload(mockFile);
      // Wait for next tick to allow the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.imageContent).toBe('mock-object-url');
    expect(result.current.rawContent).toBe('<svg width="400" height="200"></svg>');
    expect(result.current.imageMetadata).toEqual({
      width: 300,
      height: 150,
      name: 'test.svg',
    });
  });

  it('should handle file upload through event', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      target: {
        files: [mockFile],
      },
    } as any;

    const { result } = renderHook(() => useFileUploader());
    
    await act(async () => {
      result.current.handleFileUploadEvent(mockEvent);
      // Wait for next tick to allow the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.imageMetadata?.name).toBe('test.jpg');
  });

  it('should handle file upload event with no files', () => {
    const mockEvent = {
      target: {
        files: null,
      },
    } as any;
    
    const { result } = renderHook(() => useFileUploader());
    
    act(() => {
      result.current.handleFileUploadEvent(mockEvent);
    });

    // Should not crash when no files are provided
    expect(result.current.imageContent).toBe('');
  });

  it('should handle file upload event with empty files list', () => {
    const mockEvent = {
      target: {
        files: [],
      },
    } as any;
    
    const { result } = renderHook(() => useFileUploader());
    
    act(() => {
      result.current.handleFileUploadEvent(mockEvent);
    });

    // Should not crash when empty files list is provided
    expect(result.current.imageContent).toBe('');
  });

  it('should cancel upload and reset state', async () => {
    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    
    const { result } = renderHook(() => useFileUploader());
    
    // First, upload a file to set some state
    await act(async () => {
      result.current.handleFileUpload(mockFile);
      // Wait for next tick to allow the async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify state is set
    expect(result.current.imageContent).toBe('data:image/jpeg;base64,abc123');

    // Now cancel the upload
    act(() => {
      result.current.cancel();
    });

    expect(result.current.imageContent).toBe('');
    expect(result.current.imageMetadata).toBeNull();
  });
});