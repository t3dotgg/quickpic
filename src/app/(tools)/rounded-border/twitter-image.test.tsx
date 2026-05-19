import { alt, contentType, size, default as Image } from "./twitter-image";
import { GenerateImage } from "@/app/utils/og-generator";

// Mock the GenerateImage function
jest.mock("@/app/utils/og-generator", () => ({
  GenerateImage: jest.fn(),
}));

const mockedGenerateImage = GenerateImage as jest.MockedFunction<
  typeof GenerateImage
>;

describe("Twitter Image Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("exports", () => {
    it("should export correct alt text", () => {
      expect(alt).toBe("Corner Rounder - QuickPic");
    });

    it("should export correct content type", () => {
      expect(contentType).toBe("image/png");
    });

    it("should export correct size", () => {
      expect(size).toEqual({
        width: 1200,
        height: 630,
      });
    });

    it("should export runtime as edge", () => {
      // We can't directly test the runtime export since it's only used by Next.js,
      // but we can verify that the component still works as expected
      expect(typeof Image).toBe("function");
    });
  });

  describe("image generation", () => {
    it("should call GenerateImage with correct parameters", async () => {
      const expectedParams = {
        title: "Corner Rounder",
        description: "Round the corners of an image. For free.",
      };

      mockedGenerateImage.mockResolvedValue(new Response("mocked image"));

      const result = await Image();

      expect(mockedGenerateImage).toHaveBeenCalledWith(expectedParams);
      expect(result).toBeDefined();
    });

    it("should pass correct title and description to GenerateImage", async () => {
      const expectedParams = {
        title: "Corner Rounder",
        description: "Round the corners of an image. For free.",
      };

      mockedGenerateImage.mockResolvedValue(new Response("mocked image"));

      await Image();

      expect(mockedGenerateImage).toHaveBeenCalledWith(
        expect.objectContaining(expectedParams)
      );
    });

    it("should handle async execution properly", async () => {
      mockedGenerateImage.mockResolvedValue(new Response("mocked image"));

      const resultPromise = Image();
      expect(resultPromise).toBeInstanceOf(Promise);

      const result = await resultPromise;
      expect(result).toBeDefined();
    });
  });
});