import { createFileChangeEvent } from "./file-utils";

describe("file-utils", () => {
  describe("createFileChangeEvent", () => {
    it("should create a ChangeEvent with the provided file", () => {
      // Create a mock file
      const mockFile = new File(["svg content"], "test.svg", { type: "image/svg+xml" });

      // Create the change event
      const event = createFileChangeEvent(mockFile);

      // Assert the event has the expected properties
      expect(event).toBeDefined();
      expect(event.target).toBeDefined();
      expect(event.target.files).toBeDefined();
      expect(event.target.files!.length).toBe(1);
      expect(event.target.files![0]).toBe(mockFile);
    });

    it("should set the correct target properties", () => {
      const mockFile = new File(["svg content"], "test.svg", { type: "image/svg+xml" });

      const event = createFileChangeEvent(mockFile);

      expect(event.target.value).toBe("");
      expect(event.target.name).toBe("");
      expect(event.target.type).toBe("file");
      expect(event.target.accept).toBe(".svg");
      expect(event.target.multiple).toBe(false);
      expect(event.target.webkitdirectory).toBe(false);
      expect(event.target.className).toBe("hidden");
    });

    it("should have the correct event type", () => {
      const mockFile = new File(["svg content"], "test.svg", { type: "image/svg+xml" });

      const event = createFileChangeEvent(mockFile);

      expect(event.type).toBe("change");
    });

    it("should have preventDefault and stopPropagation functions", () => {
      const mockFile = new File(["svg content"], "test.svg", { type: "image/svg+xml" });

      const event = createFileChangeEvent(mockFile);

      expect(typeof event.preventDefault).toBe("function");
      expect(typeof event.stopPropagation).toBe("function");
    });

    it("should have other expected event properties", () => {
      const mockFile = new File(["svg content"], "test.svg", { type: "image/svg+xml" });

      const event = createFileChangeEvent(mockFile);

      expect(event.bubbles).toBe(true);
      expect(event.cancelable).toBe(true);
      expect(event.isTrusted).toBe(true);
      expect(typeof event.isDefaultPrevented).toBe("function");
      expect(typeof event.isPropagationStopped).toBe("function");
    });

    it("should handle empty file list correctly", () => {
      // Create a mock file with empty content
      const mockFile = new File([], "empty.svg", { type: "image/svg+xml" });

      const event = createFileChangeEvent(mockFile);

      expect(event.target.files).toBeDefined();
      expect(event.target.files!.length).toBe(1);
      expect(event.target.files![0]).toBe(mockFile);
    });
  });
});