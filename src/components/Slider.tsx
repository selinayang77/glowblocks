interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  valueText: string;
  trackBackground?: string;
  onChange: (value: number) => void;
}

export function Slider({ id, label, value, min, max, step, valueText, trackBackground, onChange }: SliderProps) {
  return (
    <div className="slider">
      <div className="slider__top">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{valueText}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        style={trackBackground ? { background: trackBackground } : undefined}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
