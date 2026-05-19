import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadBox } from "./upload-box";

describe("UploadBox", () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    title: "Upload Title",
    description: "Choose file",
    accept: ".pdf,.doc,.docx",
    onChange: mockOnChange,
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders title correctly", () => {
    render(<UploadBox {...defaultProps} />);
    expect(screen.getByText("Upload Title")).toBeInTheDocument();
  });

  it("renders description correctly", () => {
    render(<UploadBox {...defaultProps} />);
    expect(screen.getByText("Choose file")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<UploadBox {...defaultProps} subtitle="PDF only" />);
    expect(screen.getByText("PDF only")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<UploadBox {...defaultProps} />);
    expect(screen.queryByText("PDF only")).not.toBeInTheDocument();
  });

  it("renders drag and drop elements", () => {
    render(<UploadBox {...defaultProps} />);
    expect(screen.getByText("Drag and Drop")).toBeInTheDocument();
    expect(screen.getByText("or")).toBeInTheDocument();
  });

  it("renders the upload icon", () => {
    render(<UploadBox {...defaultProps} />);
    // The icon is an SVG element
    const svgElement = document.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it("renders file input with correct accept attribute", () => {
    render(<UploadBox {...defaultProps} />);
    // Get the label containing the text "Choose file"
    const label = screen.getByText("Choose file").closest('label');
    // Get the input inside the label
    const fileInput = label?.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput).toHaveAttribute("accept", ".pdf,.doc,.docx");
  });

  it("calls onChange handler when file is selected", () => {
    render(<UploadBox {...defaultProps} />);
    // Get the label containing the text "Choose file"
    const label = screen.getByText("Choose file").closest('label');
    const fileInput = label?.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(["dummy content"], "test.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          files: [file],
        }),
      })
    );
  });

  it("applies correct CSS classes to main container", () => {
    render(<UploadBox {...defaultProps} />);
    // The main container has the flex classes
    const container = screen.getByText("Upload Title").closest('div');
    // Find the actual parent container with flex classes
    const parentContainer = container?.parentElement;
    expect(parentContainer).toHaveClass("flex", "flex-col", "items-center", "justify-center", "gap-4", "p-4");
  });

  it("has the correct file upload button", () => {
    render(<UploadBox {...defaultProps} />);
    // The upload "button" is a label with button-like styling
    const button = screen.getByText("Choose file").closest('label');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("inline-flex", "cursor-pointer", "items-center", "gap-2", "rounded-lg", "bg-blue-600");
  });
});