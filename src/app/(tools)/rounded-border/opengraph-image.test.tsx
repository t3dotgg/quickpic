import { GenerateImage } from "@/app/utils/og-generator";
import Image, { alt, contentType, size } from "./opengraph-image";

// Mock the GenerateImage function to test our component
jest.mock("@/app/utils/og-generator", () => ({
  GenerateImage: jest.fn(),
}));

const mockedGenerateImage = GenerateImage as jest.MockedFunction<typeof GenerateImage>;

describe("OpenGraph Image Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have correct alt text", () => {
    expect(alt).toBe("Corner Rounder - QuickPic");
  });

  it("should have correct content type", () => {
    expect(contentType).toBe("image/png");
  });

  it("should have correct size", () => {
    expect(size).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it("should call GenerateImage with correct parameters", async () => {
    const mockImageData = new Uint8Array([1, 2, 3]);
    mockedGenerateImage.mockResolvedValue(mockImageData);

    const result = await Image();

    expect(mockedGenerateImage).toHaveBeenCalledWith({
      title: "Corner Rounder",
      description: "Round the corners of an image. For free.",
    });
    expect(result).toBe(mockImageData);
  });

  it("should handle runtime export", () => {
    // Import the module to check the runtime export
    const moduleExports = require("./opengraph-image");
    expect(moduleExports.runtime).toBe("edge");
  });
});