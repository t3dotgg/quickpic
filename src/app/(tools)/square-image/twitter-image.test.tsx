import { GenerateImage } from "@/app/utils/og-generator";
import Image, { alt, contentType, size, runtime } from "./twitter-image";

// Mock the GenerateImage function
jest.mock("@/app/utils/og-generator", () => ({
  GenerateImage: jest.fn(),
}));

const mockedGenerateImage = GenerateImage as jest.MockedFunction<typeof GenerateImage>;

describe("Twitter Image Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should have correct runtime configuration", () => {
    expect(runtime).toBe("edge");
  });

  test("should have correct alt text", () => {
    expect(alt).toBe("Square Image Generator - QuickPic");
  });

  test("should have correct content type", () => {
    expect(contentType).toBe("image/png");
  });

  test("should have correct size dimensions", () => {
    expect(size).toEqual({
      width: 1200,
      height: 630,
    });
  });

  test("should call GenerateImage with correct parameters", async () => {
    const mockResult = "mocked-image-result";
    mockedGenerateImage.mockResolvedValue(mockResult);

    const result = await Image();
    
    expect(GenerateImage).toHaveBeenCalledWith({
      title: "Square Image Generator",
    });
    expect(result).toBe(mockResult);
  });

  test("should pass correct title to GenerateImage", async () => {
    mockedGenerateImage.mockResolvedValue("mocked-image-result");

    await Image();
    
    expect(GenerateImage).toHaveBeenCalledWith({
      title: "Square Image Generator",
    });
  });
});