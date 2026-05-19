import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BorderRadiusSelector } from './border-radius-selector';

describe('BorderRadiusSelector', () => {
  const defaultProps = {
    title: 'Border Radius',
    options: [0, 4, 8, 16],
    selected: 4,
    onChange: jest.fn(),
    customValue: 10,
    onCustomValueChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the title correctly', () => {
    render(<BorderRadiusSelector {...defaultProps} />);
    expect(screen.getByText('Border Radius')).toBeInTheDocument();
  });

  it('renders all options including custom', () => {
    render(<BorderRadiusSelector {...defaultProps} />);
    defaultProps.options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('highlights the selected option', () => {
    render(<BorderRadiusSelector {...defaultProps} />);
    const selectedButton = screen.getByRole('button', { name: '4' });
    expect(selectedButton).toHaveClass('text-white');
  });

  it('calls onChange when an option is clicked', () => {
    render(<BorderRadiusSelector {...defaultProps} />);
    const optionButton = screen.getByRole('button', { name: '8' });
    fireEvent.click(optionButton);
    expect(defaultProps.onChange).toHaveBeenCalledWith(8);
  });

  it('calls onChange when custom option is selected', () => {
    render(<BorderRadiusSelector {...defaultProps} />);
    const customButton = screen.getByRole('button', { name: 'Custom' });
    fireEvent.click(customButton);
    expect(defaultProps.onChange).toHaveBeenCalledWith('custom');
  });

  it('shows custom input when custom option is selected', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" />);
    expect(screen.getByPlaceholderText('Enter radius')).toBeInTheDocument();
    expect(screen.getByText('px')).toBeInTheDocument();
  });

  it('does not show custom input when other options are selected', () => {
    render(<BorderRadiusSelector {...defaultProps} selected={8} />);
    expect(() => screen.getByPlaceholderText('Enter radius')).toThrow();
  });

  it('calls onCustomValueChange when input value changes', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" />);
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.change(input, { target: { value: '25' } });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(25);
  });

  it('clamps input value between 0 and 999', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" />);
    const input = screen.getByPlaceholderText('Enter radius');
    
    // Test with value below 0
    fireEvent.change(input, { target: { value: '-5' } });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(0);
    
    // Test with value above 999
    fireEvent.change(input, { target: { value: '1000' } });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(999);
  });

  it('handles keyboard arrow up to increase value', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={5} />);
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(6);
  });

  it('handles keyboard arrow down to decrease value', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={5} />);
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(4);
  });

  it('increases value by 10 with shift + arrow up', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={5} />);
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.keyDown(input, { key: 'ArrowUp', shiftKey: true });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(15);
  });

  it('decreases value by 10 with shift + arrow down', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={15} />);
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.keyDown(input, { key: 'ArrowDown', shiftKey: true });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(5);
  });

  it('increases value by 0.1 with alt + arrow up', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={5} />);
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.keyDown(input, { key: 'ArrowUp', altKey: true });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(5.1);
  });

  it('decreases value by 0.1 with alt + arrow down', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={5.1} />);
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.keyDown(input, { key: 'ArrowDown', altKey: true });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(5);
  });

  it('clamps keyboard-adjusted values between 0 and 999', () => {
    const { rerender } = render(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={0} />);
    let input = screen.getByPlaceholderText('Enter radius');

    // Try to go below 0
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(0);

    // Set to max value and try to go above 999
    rerender(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={999} />);
    input = screen.getByPlaceholderText('Enter radius');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(999);
  });

  it('formats decimal values to one decimal place', () => {
    render(<BorderRadiusSelector {...defaultProps} selected="custom" customValue={5.123} />);
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.keyDown(input, { key: 'ArrowUp', altKey: true });
    expect(defaultProps.onCustomValueChange).toHaveBeenCalledWith(5.2);
  });

  it('does not trigger onCustomValueChange if it is not provided', () => {
    const { onCustomValueChange, ...propsWithoutOnCustomValueChange } = defaultProps;
    render(<BorderRadiusSelector {...propsWithoutOnCustomValueChange} selected="custom" />);
    
    const input = screen.getByPlaceholderText('Enter radius');
    fireEvent.change(input, { target: { value: '25' } });
    expect(defaultProps.onCustomValueChange).not.toHaveBeenCalled();
  });

  it('renders with different selected values', () => {
    // Test with different options selected
    const { rerender } = render(<BorderRadiusSelector {...defaultProps} selected={8} />);
    expect(screen.getByRole('button', { name: '8' })).toHaveClass('text-white');
    
    // Test with custom selected
    rerender(<BorderRadiusSelector {...defaultProps} selected="custom" />);
    expect(screen.getByRole('button', { name: 'Custom' })).toHaveClass('text-white');
  });
});