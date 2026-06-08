import React from 'react';

/**
 * SVG DonutChart component
 * Takes segments: [{ value, color, label }]
 */
export default function DonutChart({ segments, size = 160, thickness = 32, centerLabel, centerSub }) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    if (total === 0) return null;

    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const cx = size / 2;
    const cy = size / 2;

    let offset = 0;
    const circles = segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const el = (
            <circle
                key={i}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'all 0.5s ease' }}
            />
        );
        offset += dash;
        return el;
    });

    return (
        <svg width={size} height={size} className="donut-wrapper">
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
            {circles}
            {centerLabel && (
                <text x={cx} y={cy - 8} textAnchor="middle" fill="#1e293b" fontSize="15" fontWeight="800" fontFamily="Inter, sans-serif">
                    {centerLabel}
                </text>
            )}
            {centerSub && (
                <text x={cx} y={cy + 12} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
                    {centerSub}
                </text>
            )}
        </svg>
    );
}
