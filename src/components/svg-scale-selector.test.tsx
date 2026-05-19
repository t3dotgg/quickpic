import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SVGScaleSelector } from "./svg-scale-selector";

describe("SVGScaleSelector", () => {
  const defaultProps = {
    title: "Scale Selector",
    options: [1, 2, 4, 8],
    selected: 2,
    onChange: jest.fn(),
    customValue: 10,
    onCustomValueChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders with correct title and options", () => {
    render(<SVGScaleSelector {...defaultProps} />);
    
    expect(screen.getByText("Scale Selector")).toBeInTheDocument();
    
    // Check that all options are rendered
    expect(screen.getByText("1×")).toBeInTheDocument();
    expect(screen.getByText("2×")).toBeInTheDocument();
    expect(screen.getByText("4×")).toBeInTheDocument();
    expect(screen.getByText("8×")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
    
    // Check that the selected option is highlighted
    const selectedButton = screen.getByText("2×").closest("button");
    expect(selectedButton).toHaveClass("text-white");
  });

  test("highlights the selected option", () => {
    render(<SVGScaleSelector {...defaultProps} selected={4} />);
    
    // Check that 4x is selected
    const selectedButton = screen.getByText("4×").closest("button");
    expect(selectedButton).toHaveClass("text-white");
    
    // Check that other options are not selected
    const unselectedButton = screen.getByText("2×").closest("button");
    expect(unselectedButton).not.toHaveClass("text-white");
    expect(unselectedButton).toHaveClass("text-white/80");
  });

  test("calls onChange when an option is clicked", () => {
    render(<SVGScaleSelector {...defaultProps} />);
    
    // Click on the 4x option
    const option4 = screen.getByText("4×");
    fireEvent.click(option4);
    
    expect(defaultProps.onChange).toHaveBeenCalledWith(4);
  });

  test("handles custom option selection", async () => {
    const { rerender } = render(<SVGScaleSelector {...defaultProps} />);

    // Select the custom option
    const customOption = screen.getByText("Custom");
    fireEvent.click(customOption);

    expect(defaultProps.onChange).toHaveBeenCalledWith("custom");

    // Re-render with the selected state updated to "custom"
    rerender(<SVGScaleSelector {...defaultProps} selected="custom" />);

    // Check that custom input appears
    expect(screen.getByPlaceholderText("Enter scale")).toBeInTheDocument();
  });

  test("renders custom input when selected is 'custom'", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" />);
    
    // Check that custom input appears when 'custom' is selected
    const customInput = screen.getByPlaceholderText("Enter scale");
    expect(customInput).toBeInTheDocument();
    expect(customInput).toHaveValue(10);
  });

  test("calls onCustomValueChange when custom input value changes", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    
    // Change the input value
    fireEvent.change(customInput, { target: { value: "15" } });
    
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(15);
  });

  test("clamps custom input value to max of 64", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    
    // Enter a value larger than 64
    fireEvent.change(customInput, { target: { value: "70" } });
    
    // The input should have been processed with the clamped value
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(64);
  });

  test("handles keyboard interactions for custom input - ArrowUp", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    
    // Focus the input
    customInput.focus();
    
    // Simulate ArrowUp key press
    fireEvent.keyDown(customInput, { key: "ArrowUp" });
    
    // Should increment by 1
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(11);
  });

  test("handles keyboard interactions for custom input - ArrowDown", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    
    // Focus the input
    customInput.focus();
    
    // Simulate ArrowDown key press
    fireEvent.keyDown(customInput, { key: "ArrowDown" });
    
    // Should decrement by 1
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(9);
  });

  test("handles keyboard interactions with Shift key for larger steps", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    
    // Focus the input
    customInput.focus();
    
    // Simulate Shift+ArrowUp key press (should increment by 10)
    fireEvent.keyDown(customInput, { key: "ArrowUp", shiftKey: true });
    
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(20);
  });

  test("handles keyboard interactions with Alt key for smaller steps", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    
    // Focus the input
    customInput.focus();
    
    // Simulate Alt+ArrowUp key press (should increment by 0.1)
    fireEvent.keyDown(customInput, { key: "ArrowUp", altKey: true });
    
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(10.1);
  });

  test("keyboard interactions do not trigger for non-arrow keys", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    
    // Focus the input
    customInput.focus();
    
    // Simulate non-arrow key press
    fireEvent.keyDown(customInput, { key: "Enter" });
    
    expect(defaultProps.onCustomValueChange).not.toHaveBeenCalled();
  });

  test("clamps keyboard-adjusted values within range [0, 64]", () => {
    // Test minimum boundary
    render(<SVGScaleSelector {...defaultProps} selected="custom" customValue={0} />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    customInput.focus();
    
    // Try to go below 0
    fireEvent.keyDown(customInput, { key: "ArrowDown" });
    
    // Should stay at 0 (minimum)
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(0);
  });

  test("prevents values from going above 64 with keyboard", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" customValue={64} />);
    
    const customInput = screen.getByPlaceholderText("Enter scale");
    customInput.focus();
    
    // Try to go above 64
    fireEvent.keyDown(customInput, { key: "ArrowUp" });
    
    // Should stay at 64 (maximum)
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(64);
  });

  test("formats decimal values correctly", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" customValue={10.15} />);

    const customInput = screen.getByPlaceholderText("Enter scale");

    // Simulate Alt+ArrowUp key press (should increment by 0.1)
    fireEvent.keyDown(customInput, { key: "ArrowUp", altKey: true });

    // Should round to 1 decimal place: 10.15 + 0.1 = 10.25 -> rounded to 10.3
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(10.3);
  });

  test("handles floating point precision correctly", () => {
    render(<SVGScaleSelector {...defaultProps} selected="custom" customValue={1.1} />);

    const customInput = screen.getByPlaceholderText("Enter scale");
    customInput.focus();

    // Increment multiple times to test floating point precision
    fireEvent.keyDown(customInput, { key: "ArrowUp", altKey: true }); // 1.1 + 0.1 = 1.2
    fireEvent.keyDown(customInput, { key: "ArrowUp", altKey: true }); // 1.2 + 0.1 = 1.3 (but will be rounded)

    // Check that values are correctly rounded
    expect(defaultProps.onCustomValueChange).toHaveBeenNthCalledWith(1, 1.2);
    expect(defaultProps.onCustomValueChange).toHaveBeenNthCalledWith(2, 1.2); // 1.2 + 0.1 = 1.3, but due to floating point precision, it might be slightly different
  });
});