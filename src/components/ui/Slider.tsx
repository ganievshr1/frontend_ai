import React from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
}

const Slider: React.FC<SliderProps> = ({
  min,
  max,
  step,
  value,
  onChange,
  label
}) => {
  return (
    <div className="slider-container">
      {label && (
        <div className="slider-header">
          <span className="slider-label">{label}</span>
          <span className="slider-value">{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-input"
      />
    </div>
  );
};

export default Slider;