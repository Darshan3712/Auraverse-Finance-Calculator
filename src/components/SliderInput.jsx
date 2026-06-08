import React, { useState, useEffect } from 'react';

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
    const [tempValue, setTempValue] = useState(value !== undefined ? value.toString() : '');

    // Sync local state when parent value changes (e.g. via slider movement)
    useEffect(() => {
        if (value !== undefined) {
            const parsedLocal = parseFloat(tempValue);
            if (parsedLocal !== value && !isNaN(value)) {
                setTempValue(value.toString());
            }
        }
    }, [value]);

    const progress = ((value - min) / (max - min)) * 100;

    const handleSlider = (e) => {
        const val = parseFloat(e.target.value);
        onChange(val);
        setTempValue(val.toString());
    };

    const handleInput = (e) => {
        const raw = e.target.value;
        setTempValue(raw);

        const cleaned = raw.replace(/,/g, '');
        if (cleaned === '' || cleaned === '-') {
            return; // Let them type empty or negative state before updating parent
        }

        const val = parseFloat(cleaned);
        if (!isNaN(val)) {
            // Update parent, but DO NOT clamp while typing so they can type freely
            onChange(val);
        }
    };

    const handleBlur = (e) => {
        const raw = e.target.value.replace(/,/g, '');
        const val = parseFloat(raw);
        const clamped = isNaN(val) ? min : Math.min(max, Math.max(min, val));
        onChange(clamped);
        setTempValue(clamped.toString());
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
                value={isNaN(value) || value < min ? min : value > max ? max : value}
                onChange={handleSlider}
                style={{ '--progress': `${progress < 0 ? 0 : progress > 100 ? 100 : progress}%` }}
            />

            {/* Right-aligned input box + unit below it */}
            <div className="input-value-row">
                <div className="input-value-stack">
                    <input
                        type="number"
                        className="input-field"
                        value={tempValue}
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
