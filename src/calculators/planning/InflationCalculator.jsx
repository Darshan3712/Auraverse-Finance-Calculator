import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateInflation, formatINR, formatNumber } from '../../utils/calculations';

const ITEM_PRESETS = [
    { label: '🛒 Groceries', cost: 10000 },
    { label: '🏠 Rent', cost: 25000 },
    { label: '🏥 Healthcare', cost: 15000 },
    { label: '🎓 Education', cost: 50000 },
    { label: '✈️ Vacation', cost: 100000 },
    { label: '🚗 Vehicle', cost: 1000000 },
    { label: '🏡 Property', cost: 8000000 },
    { label: '⚙️ Custom', cost: 50000 },
];

// Historical Indian inflation reference rates
const INFLATION_REFERENCE = [
    { category: 'General CPI (India Avg)', rate: 6.0 },
    { category: 'Food & Beverages', rate: 7.5 },
    { category: 'Housing', rate: 4.5 },
    { category: 'Healthcare / Medical', rate: 8.0 },
    { category: 'Education', rate: 10.0 },
    { category: 'Fuel & Energy', rate: 5.5 },
    { category: 'Clothing & Footwear', rate: 4.0 },
];

export default function InflationCalculator() {
    const [currentCost, setCurrentCost] = useState(50000);
    const [inflationRate, setInflationRate] = useState(6);
    const [years, setYears] = useState(10);
    const [selectedPreset, setSelectedPreset] = useState(ITEM_PRESETS[7]);

    const handlePresetChange = (preset) => {
        setSelectedPreset(preset);
        setCurrentCost(preset.cost);
    };

    const result = useMemo(
        () => calculateInflation(currentCost, inflationRate, years),
        [currentCost, inflationRate, years]
    );

    const donutSegments = [
        { value: currentCost, color: '#4f8ef7', label: 'Today\'s Value' },
        { value: result.inflationCost, color: '#f59e0b', label: 'Inflation Erosion' },
    ];

    const purchasingPowerSegments = [
        { value: result.purchasingPower, color: '#10b981', label: 'Retained Value' },
        { value: 100 - result.purchasingPower, color: '#ef4444', label: 'Value Lost to Inflation' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">📉 Inflation Rate Calculator</h1>
            <p className="calc-subtitle">
                Understand how inflation silently erodes the value of your money. See the real future cost of today's expenses and protect your financial goals.
            </p>

            {/* ── Preset Selector ── */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-title">Quick Select an Expense Category</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ITEM_PRESETS.map((preset, index) => (
                        <button
                            key={index}
                            onClick={() => handlePresetChange(preset)}
                            className={`strategy-tab ${selectedPreset.label === preset.label ? 'active' : ''}`}
                            style={{
                                padding: '9px 14px',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                flex: '1 1 auto',
                                textAlign: 'center',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '13px',
                            }}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="calc-grid">
                {/* ── LEFT: Inputs ── */}
                <div className="card">
                    <div className="card-title">Inflation Parameters</div>
                    <SliderInput
                        label="Current Cost / Value Today"
                        value={currentCost}
                        onChange={setCurrentCost}
                        min={1000}
                        max={50000000}
                        step={1000}
                        unit="₹"
                    />
                    <SliderInput
                        label="Expected Annual Inflation Rate"
                        value={inflationRate}
                        onChange={setInflationRate}
                        min={1}
                        max={20}
                        step={0.5}
                        unit="%"
                    />
                    <SliderInput
                        label="Time Period"
                        value={years}
                        onChange={setYears}
                        min={1}
                        max={50}
                        step={1}
                        unit="Years"
                    />

                    {/* Purchasing Power Badge */}
                    <div style={{
                        marginTop: '20px',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.08))',
                        border: '1px solid rgba(239,68,68,0.2)',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            Purchasing Power After {years} Years
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: result.purchasingPower < 50 ? '#ef4444' : result.purchasingPower < 75 ? '#f59e0b' : '#10b981', marginTop: '4px' }}>
                            {result.purchasingPower.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            ₹100 today will only buy ₹{result.purchasingPower.toFixed(1)} worth of goods in {years} years
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Charts ── */}
                <div className="card">
                    <div className="card-title">Future Cost Breakdown</div>
                    <div className="chart-section">
                        <DonutChart
                            segments={donutSegments}
                            size={160}
                            thickness={32}
                            centerLabel={formatINR(result.futureCost)}
                            centerSub="Future Cost"
                        />
                        <div className="chart-legend">
                            {donutSegments.map((s, i) => (
                                <div className="legend-item" key={i}>
                                    <div className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-label">{s.label}</span>
                                    <span className="legend-value">{formatINR(s.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-divider" />

                    <div className="card-title">Purchasing Power Erosion</div>
                    <div className="chart-section">
                        <DonutChart
                            segments={purchasingPowerSegments}
                            size={140}
                            thickness={28}
                            centerLabel={`${result.purchasingPower.toFixed(1)}%`}
                            centerSub="Retained"
                        />
                        <div className="chart-legend">
                            {purchasingPowerSegments.map((s, i) => (
                                <div className="legend-item" key={i}>
                                    <div className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-label">{s.label}</span>
                                    <span className="legend-value">{s.value.toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Key Result Cards ── */}
            <div className="results-grid">
                <div className="result-card highlight">
                    <div className="result-label">Future Cost in {years} Years</div>
                    <div className="result-value accent">₹{formatNumber(result.futureCost)}</div>
                    <div className="result-sub">At {inflationRate}% annual inflation</div>
                </div>
                <div className="result-card" style={{ borderTop: '3px solid #ef4444' }}>
                    <div className="result-label">Inflation Erosion (₹)</div>
                    <div className="result-value" style={{ color: '#ef4444' }}>₹{formatNumber(result.inflationCost)}</div>
                    <div className="result-sub">Extra amount due to inflation</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">CAGR to Beat Inflation</div>
                    <div className="result-value success">{(inflationRate).toFixed(1)}%+</div>
                    <div className="result-sub">Minimum return to stay neutral</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Doubling Time (Rule of 72)</div>
                    <div className="result-value warning">{result.doublingTime.toFixed(1)} Yrs</div>
                    <div className="result-sub">Time for prices to double</div>
                </div>
            </div>

            {/* ── Year-by-Year Projection Table ── */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Year-Wise Inflation Projection</div>
                <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Inflated Cost (₹)</th>
                                <th>Rise from Today (₹)</th>
                                <th>Purchasing Power</th>
                                <th>Equivalent Today's ₹100</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.yearlyBreakdown.map(row => (
                                <tr key={row.year}>
                                    <td>Year {row.year}</td>
                                    <td>₹{formatNumber(row.futureCost)}</td>
                                    <td style={{ color: '#f59e0b', fontWeight: 600 }}>+₹{formatNumber(row.erosion)}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: 700,
                                            color: row.purchasingPower < 50 ? 'var(--accent-danger)' : row.purchasingPower < 75 ? 'var(--accent-warning)' : 'var(--accent-success)',
                                        }}>
                                            {row.purchasingPower.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td>₹{row.purchasingPower.toFixed(1)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Historical Inflation Reference ── */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">📊 India Historical Inflation Reference Rates</div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Avg Inflation Rate</th>
                                <th>Cost of ₹{formatNumber(currentCost)} in {years} Years</th>
                            </tr>
                        </thead>
                        <tbody>
                            {INFLATION_REFERENCE.map((ref, i) => {
                                const refCost = Math.round(currentCost * Math.pow(1 + ref.rate / 100, years));
                                return (
                                    <tr key={i}>
                                        <td>{ref.category}</td>
                                        <td>
                                            <span style={{ fontWeight: 700, color: ref.rate >= 8 ? '#ef4444' : ref.rate >= 6 ? '#f59e0b' : '#10b981' }}>
                                                {ref.rate}%
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>₹{formatNumber(refCost)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="info-box" style={{ marginTop: 20 }}>
                💡 <strong>Inflation Insight:</strong> At {inflationRate}% inflation, prices double every{' '}
                <strong>{result.doublingTime.toFixed(1)} years</strong> (Rule of 72). Your current expense of{' '}
                ₹{formatNumber(currentCost)} will cost ₹{formatNumber(result.futureCost)} in {years} years.
                To protect your wealth, invest in assets that return more than {inflationRate}% annually —
                typically equity mutual funds, real estate, or other growth assets. Your money in a savings
                account earning ~3.5% is losing real purchasing power every year.
            </div>
        </div>
    );
}
