import React from 'react';

/**
 * SliderInput Layout:
 *
 *   Label
 *   [────────────────── slider ──────────────────]
 *                                        [ value ]
 *                                           unit
 *
 * Input box is right-aligned. Unit text appears centered below the box.
 */
export default function SliderInput({ label, value, onChange, min, max, step = 1, unit = '' }) {
    const progress = ((value - min) / (max - min)) * 100;

    const handleSlider = (e) => {
        onChange(parseFloat(e.target.value));
    };

    const handleInput = (e) => {
        const raw = e.target.value.replace(/,/g, '');
        if (raw === '' || raw === '-') return;
        const val = parseFloat(raw);
        if (!isNaN(val)) onChange(val);
    };

    const handleBlur = (e) => {
        const val = parseFloat(e.target.value.replace(/,/g, ''));
        if (!isNaN(val)) onChange(Math.min(max, Math.max(min, val)));
        else onChange(min);
    };

    return (
        <div className="input-group">
            {/* Label row */}
            <label className="input-label">{label}</label>

            {/* Full-width slider */}
            <input
                type="range"
                className="range-slider"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleSlider}
                style={{ '--progress': `${progress}%` }}
            />

            {/* Right-aligned input box + unit below it */}
            <div className="input-value-row">
                <div className="input-value-stack">
                    <input
                        type="number"
                        className="input-field"
                        value={value}
                        onChange={handleInput}
                        onBlur={handleBlur}
                        min={min}
                        max={max}
                        step={step}
                    />
                    {unit && <span className="input-unit">{unit}</span>}
                </div>
            </div>
        </div>
    );
}
