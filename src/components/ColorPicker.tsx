"use client";
import { debounce } from "@/utils/debounce";
import React, { FC, useMemo } from "react";

type IColorPickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
};

const ColorPicker: FC<IColorPickerProps> = ({ onChange, value, id }) => {
  const handleColorChange = useMemo(() => {
    return debounce((color: string) => {
      onChange?.(color);
    }, 200);
  }, [onChange]);

  return (
    <input
      type="color"
      value={value}
      id={id}
      title="Pick a color"
      onChange={(e) => handleColorChange(e.target.value)}
    />
  );
};

export default ColorPicker;
