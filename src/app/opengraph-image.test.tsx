import { GenerateImage } from "./utils/og-generator";
import Image, { alt, contentType, size, runtime } from "./opengraph-image";

// Mock the GenerateImage function
jest.mock("./utils/og-generator", () => ({
  GenerateImage: jest.fn(),
}));

const mockGenerateImage = GenerateImage as jest.MockedFunction<
  typeof GenerateImage
>;

describe("Open Graph Image Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("runtime", () => {
    it("should be set to 'edge'", () => {
      expect(runtime).toBe("edge");
    });
  });

  describe("alt", () => {
    it("should be set to 'QuickPic'", () => {
      expect(alt).toBe("QuickPic");
    });
  });

  describe("contentType", () => {
    it("should be set to 'image/png'", () => {
      expect(contentType).toBe("image/png");
    });
  });

  describe("size", () => {
    it("should have the correct dimensions", () => {
      expect(size).toEqual({
        width: 1200,
        height: 630,
      });
    });

    it("should have width of 1200", () => {
      expect(size.width).toBe(1200);
    });

    it("should have height of 630", () => {
      expect(size.height).toBe(630);
    });
  });

  describe("Image function", () => {
    it("should call GenerateImage with correct parameters", async () => {
      const mockImageData = new Uint8Array([1, 2, 3, 4]);
      mockGenerateImage.mockResolvedValue(mockImageData);

      const result = await Image();

      expect(mockGenerateImage).toHaveBeenCalledWith({
        title: "QuickPic",
        description: "Quick and free tools for pictures.",
      });
      expect(result).toBe(mockImageData);
    });

    it("should handle async execution properly", async () => {
      const mockImageData = new Uint8Array([5, 6, 7, 8]);
      mockGenerateImage.mockResolvedValue(mockImageData);

      const resultPromise = Image();
      expect(resultPromise).toBeInstanceOf(Promise);

      const result = await resultPromise;
      expect(result).toBe(mockImageData);
    });

    it("should pass the correct title and description to GenerateImage", async () => {
      const expectedParams = {
        title: "QuickPic",
        description: "Quick and free tools for pictures.",
      };

      mockGenerateImage.mockResolvedValue(new Uint8Array());

      await Image();

      expect(mockGenerateImage).toHaveBeenCalledWith(expectedParams);
    });

    it("should return the result from GenerateImage", async () => {
      const expectedOutput = new Uint8Array([9, 10, 11, 12]);
      mockGenerateImage.mockResolvedValue(expectedOutput);

      const actualOutput = await Image();

      expect(actualOutput).toBe(expectedOutput);
    });

    it("should handle errors from GenerateImage", async () => {
      const errorMessage = "GenerateImage failed";
      mockGenerateImage.mockRejectedValue(new Error(errorMessage));

      await expect(Image()).rejects.toThrow(errorMessage);
    });
  });
});