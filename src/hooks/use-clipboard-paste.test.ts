import { renderHook } from "@testing-library/react";
import { useClipboardPaste } from "./use-clipboard-paste";

// Mock document.addEventListener and removeEventListener
const addEventListenerMock = jest.fn();
const removeEventListenerMock = jest.fn();

Object.defineProperty(document, "addEventListener", {
  value: addEventListenerMock,
});
Object.defineProperty(document, "removeEventListener", {
  value: removeEventListenerMock,
});

// Mock clipboard data
const createMockClipboardEvent = (items: DataTransferItem[] = []) => {
  const event = new Event("paste") as ClipboardEvent;
  Object.defineProperty(event, "clipboardData", {
    value: {
      items: {
        length: items.length,
        forEach: (callback: (item: DataTransferItem, index: number) => void) => {
          items.forEach((item, index) => callback(item, index));
        },
        [Symbol.iterator]: function* () {
          for (let i = 0; i < items.length; i++) {
            yield items[i];
          }
        },
        ...items,
      },
    },
    writable: true,
  });
  return event;
};

const createMockFile = (name: string, type: string): File => {
  const file = new File([], name, { type });
  return file;
};

const createMockDataTransferItem = (kind: string, type: string, file: File | null): DataTransferItem => {
  return {
    kind,
    type,
    getAsFile: () => file,
    getAsString: () => "",
    typeIndex: 0,
  } as unknown as DataTransferItem;
};

describe("useClipboardPaste", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add paste event listener on mount and remove on unmount", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/*"];

    const { unmount } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    expect(addEventListenerMock).toHaveBeenCalledWith("paste", expect.any(Function));
    expect(removeEventListenerMock).not.toHaveBeenCalled();

    unmount();
    expect(removeEventListenerMock).toHaveBeenCalledWith("paste", expect.any(Function));
  });

  it("should call onPaste when pasting an accepted image file", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/*"];
    const mockFile = createMockFile("test.png", "image/png");
    const mockItem = createMockDataTransferItem("file", "image/png", mockFile);

    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    // Get the event handler from the addEventListener call
    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;

    // Create a paste event with the mock item
    const pasteEvent = createMockClipboardEvent([mockItem]);
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    expect(onPaste).toHaveBeenCalledWith(mockFile);
  });

  it("should call onPaste when pasting an accepted image file with specific type", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/png"];
    const mockFile = createMockFile("test.png", "image/png");
    const mockItem = createMockDataTransferItem("file", "image/png", mockFile);

    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;
    const pasteEvent = createMockClipboardEvent([mockItem]);
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    expect(onPaste).toHaveBeenCalledWith(mockFile);
  });

  it("should call onPaste when pasting an accepted image file with extension-based type", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = [".png"];
    const mockFile = createMockFile("test.png", "image/png");
    const mockItem = createMockDataTransferItem("file", "image/png", mockFile);

    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;
    const pasteEvent = createMockClipboardEvent([mockItem]);
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    expect(onPaste).toHaveBeenCalledWith(mockFile);
  });

  it("should not call onPaste when pasting a non-image file", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/*"];
    const mockFile = createMockFile("test.txt", "text/plain");
    const mockItem = createMockDataTransferItem("file", "text/plain", mockFile);

    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;
    const pasteEvent = createMockClipboardEvent([mockItem]);
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
    expect(onPaste).not.toHaveBeenCalled();
  });

  it("should not call onPaste when pasting an image file that is not in accepted types", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/jpeg"];
    const mockFile = createMockFile("test.png", "image/png");
    const mockItem = createMockDataTransferItem("file", "image/png", mockFile);

    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;
    const pasteEvent = createMockClipboardEvent([mockItem]);
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
    expect(onPaste).not.toHaveBeenCalled();
  });

  it("should not call onPaste when clipboardData is null", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/*"];
    
    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;
    const pasteEvent = new Event("paste") as ClipboardEvent;
    Object.defineProperty(pasteEvent, "clipboardData", { value: null, writable: true });
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
    expect(onPaste).not.toHaveBeenCalled();
  });

  it("should not call onPaste when clipboardData items are null", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/*"];
    
    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;
    const pasteEvent = new Event("paste") as ClipboardEvent;
    Object.defineProperty(pasteEvent, "clipboardData", { 
      value: { items: null },
      writable: true 
    });
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
    expect(onPaste).not.toHaveBeenCalled();
  });

  it("should not call onPaste when getAsFile returns null", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/png"];
    const mockItem = {
      kind: "file",
      type: "image/png",
      getAsFile: () => null,
      getAsString: () => "",
      typeIndex: 0,
    } as unknown as DataTransferItem;

    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;
    const pasteEvent = createMockClipboardEvent([mockItem]);
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
    expect(onPaste).not.toHaveBeenCalled();
  });

  it("should handle multiple clipboard items and process the first accepted one", () => {
    const onPaste = jest.fn();
    const acceptedFileTypes = ["image/png"];
    
    const acceptedFile = createMockFile("accepted.png", "image/png");
    const rejectedFile = createMockFile("rejected.jpg", "image/jpeg");
    
    const acceptedItem = createMockDataTransferItem("file", "image/png", acceptedFile);
    const rejectedItem = createMockDataTransferItem("file", "image/jpeg", rejectedFile);

    const { result } = renderHook(() => 
      useClipboardPaste({ onPaste, acceptedFileTypes })
    );

    const pasteHandler = addEventListenerMock.mock.calls[0][1] as (event: ClipboardEvent) => void;
    const pasteEvent = createMockClipboardEvent([rejectedItem, acceptedItem]);
    Object.defineProperty(pasteEvent, "preventDefault", { value: jest.fn() });

    pasteHandler(pasteEvent);

    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    expect(onPaste).toHaveBeenCalledWith(acceptedFile);
    // Should only be called once with the accepted file
    expect(onPaste).toHaveBeenCalledTimes(1);
  });
});