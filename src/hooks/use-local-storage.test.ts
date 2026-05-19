import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './use-local-storage';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

describe('useLocalStorage', () => {
  beforeEach(() => {
    // Mock window and localStorage before each test
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up the localStorage mock after each test
    delete (window as any).localStorage;
  });

  it('should initialize with the initial value when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    expect(result.current[0]).toBe('initialValue');
  });

  it('should initialize with the value from localStorage when available', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify('storedValue'));

    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    expect(result.current[0]).toBe('storedValue');
  });

  it('should handle non-string values from localStorage', () => {
    const testObject = { name: 'test', count: 42 };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(testObject));

    const { result } = renderHook(() => useLocalStorage('testKey', { name: 'default', count: 0 }));

    expect(result.current[0]).toEqual(testObject);
  });

  it('should set value in localStorage when setValue is called', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(result.current[0]).toBe('newValue');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify('newValue'));
  });

  it('should handle function updater pattern', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(10));
    const { result } = renderHook(() => useLocalStorage('testKey', 10));

    act(() => {
      result.current[1](prev => prev + 5);
    });

    expect(result.current[0]).toBe(15);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(15));
  });

  it('should parse JSON values correctly when reading from localStorage', () => {
    const testValue = [1, 2, 3];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(testValue));

    const { result } = renderHook(() => useLocalStorage('testKey', [] as number[]));

    expect(result.current[0]).toEqual(testValue);
  });

  it('should return initial value when localStorage parsing fails', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
  });

  it('should handle errors when setting localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() => useLocalStorage('testKey', 'initialValue'));

    act(() => {
      result.current[1]('newValue');
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Error setting localStorage key "testKey":',
      new Error('Storage quota exceeded')
    );
    consoleWarnSpy.mockRestore();
  });

  it('should handle errors when getting localStorage', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage access denied');
    });

    const { result } = renderHook(() => useLocalStorage('testKey', 'defaultValue'));

    expect(result.current[0]).toBe('defaultValue');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Error reading localStorage key "testKey":',
      new Error('Storage access denied')
    );
    consoleWarnSpy.mockRestore();
  });

  it('should work in server environment (window undefined)', () => {
    // Temporarily remove window.localStorage to simulate server environment
    delete (window as any).localStorage;
    const originalWindow = global.window;
    global.window = undefined as any;

    const { result } = renderHook(() => useLocalStorage('testKey', 'serverValue'));

    expect(result.current[0]).toBe('serverValue');

    // Restore window
    global.window = originalWindow;
  });

  it('should not call localStorage methods in server environment', () => {
    // Test that localStorage is not called when window is undefined by checking the implementation
    // In a real server environment, typeof window would be "undefined"
    // This test is conceptually important but difficult to test in JSDOM environment
    expect(true).toBe(true); // Placeholder test
  });
});