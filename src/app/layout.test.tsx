import React from "react";
import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";

// Mock the next/font/local import
jest.mock("next/font/local", () => ({
  __esModule: true,
  default: () => ({
    variable: "--font-geist-sans",
  }),
  localFont: () => ({
    variable: "--font-geist-sans",
  })
}));

// Mock the PlausibleProvider
jest.mock("next-plausible", () => {
  const PlausibleProvider = ({ children }: { children: React.ReactNode }) => children;
  return {
    __esModule: true,
    default: PlausibleProvider,
  };
});

// Mock the CSS import
jest.mock("./globals.css", () => ({}));

// Reset modules to ensure clean mocks for each test
beforeEach(() => {
  jest.resetModules();
});

describe("RootLayout", () => {
  const mockChildren = React.createElement("div", { "data-testid": "children" }, "Test Content");

  it("renders the html element with lang attribute", () => {
    render(React.createElement(RootLayout, null, mockChildren));

    const htmlElement = document.documentElement;
    expect(htmlElement.lang).toBe("en");
  });

  it("renders the children inside the body", () => {
    render(React.createElement(RootLayout, null, mockChildren));

    const childrenElement = screen.getByTestId("children");
    expect(childrenElement).toBeInTheDocument();
    expect(childrenElement.textContent).toBe("Test Content");
  });

  it("applies the font variables to the body class", () => {
    render(React.createElement(RootLayout, null, mockChildren));

    const bodyElement = document.body;
    expect(bodyElement.className).toContain("--font-geist-sans");
    expect(bodyElement.className).toContain("dark");
    expect(bodyElement.className).toContain("antialiased");
  });

  it("includes the children in the output", () => {
    const testContent = "Layout Test Content";
    const testElement = React.createElement("div", null, testContent);
    render(React.createElement(RootLayout, null, testElement));

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });
});