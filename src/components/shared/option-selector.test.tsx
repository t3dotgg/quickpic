import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OptionSelector } from "./option-selector";

describe("OptionSelector", () => {
  const mockOptions = ["option1", "option2", "option3"];
  const mockTitle = "Test Title";
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test("renders component with title and options", () => {
    render(
      <OptionSelector
        title={mockTitle}
        options={mockOptions}
        selected="option1"
        onChange={mockOnChange}
      />
    );

    // Check if title is rendered
    expect(screen.getByText(mockTitle)).toBeInTheDocument();

    // Check if all options are rendered
    mockOptions.forEach((option) => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  test("highlight is shown for selected option", () => {
    const selectedOption = "option2";
    render(
      <OptionSelector
        title={mockTitle}
        options={mockOptions}
        selected={selectedOption}
        onChange={mockOnChange}
      />
    );

    // The selected option should have white text (not the faded version)
    const selectedButton = screen.getByRole("button", { name: selectedOption });
    expect(selectedButton).toHaveClass("text-white");
    expect(selectedButton).not.toHaveClass("text-white/80");

    // Other options should have faded text
    const otherOptions = mockOptions.filter((opt) => opt !== selectedOption);
    otherOptions.forEach((option) => {
      const button = screen.getByRole("button", { name: option });
      expect(button).toHaveClass("text-white/80");
      expect(button).not.toHaveClass("text-white");
    });
  });

  test("calls onChange with correct option when clicked", () => {
    render(
      <OptionSelector
        title={mockTitle}
        options={mockOptions}
        selected="option1"
        onChange={mockOnChange}
      />
    );

    const optionToClick = "option2";
    const buttonToClick = screen.getByRole("button", { name: optionToClick });

    fireEvent.click(buttonToClick);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(optionToClick);
  });

  test("applies custom formatOption function", () => {
    const customFormat = (option: string) => `Custom ${option.toUpperCase()}`;
    render(
      <OptionSelector
        title={mockTitle}
        options={mockOptions}
        selected="option1"
        onChange={mockOnChange}
        formatOption={customFormat}
      />
    );

    // Check that custom formatting is applied to all options
    mockOptions.forEach((option) => {
      expect(screen.getByText(`Custom ${option.toUpperCase()}`)).toBeInTheDocument();
    });
  });

  test("updates highlight when selected option changes", async () => {
    const { rerender } = render(
      <OptionSelector
        title={mockTitle}
        options={mockOptions}
        selected="option1"
        onChange={mockOnChange}
      />
    );

    // Initially option1 should be selected
    expect(screen.getByRole("button", { name: "option1" })).toHaveClass("text-white");
    expect(screen.getByRole("button", { name: "option2" })).toHaveClass("text-white/80");

    // Rerender with different selected option
    rerender(
      <OptionSelector
        title={mockTitle}
        options={mockOptions}
        selected="option2"
        onChange={mockOnChange}
      />
    );

    // option2 should now be selected, option1 should not be
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "option2" })).toHaveClass("text-white");
      expect(screen.getByRole("button", { name: "option1" })).toHaveClass("text-white/80");
    });
  });

  test("handles number options correctly", () => {
    const numberOptions = [1, 2, 3];
    const mockNumberOnChange = jest.fn();

    render(
      <OptionSelector
        title={mockTitle}
        options={numberOptions}
        selected={2}
        onChange={mockNumberOnChange}
      />
    );

    // Check if number options are rendered
    numberOptions.forEach((option) => {
      expect(screen.getByText(option.toString())).toBeInTheDocument();
    });

    // Check that the selected number option has correct styling
    const selectedButton = screen.getByRole("button", { name: "2" });
    expect(selectedButton).toHaveClass("text-white");

    // Click on another number option
    const buttonToClick = screen.getByRole("button", { name: "1" });
    fireEvent.click(buttonToClick);

    expect(mockNumberOnChange).toHaveBeenCalledWith(1);
  });

  test("applies default formatting when formatOption is not provided", () => {
    render(
      <OptionSelector
        title={mockTitle}
        options={[1, "str", true]}
        selected={1}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("str")).toBeInTheDocument();
    expect(screen.getByText("true")).toBeInTheDocument();
  });
});