import { useState, useMemo, useEffect } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateGoalPlanning, formatINR, formatNumber } from '../../utils/calculations';

const PRESETS = [
    { label: '🚗 Buy a Car', cost: 1000000, years: 5, inflation: 5, returns: 10, savings: 100000 },
    { label: '🏡 Buy a House', cost: 7500000, years: 10, inflation: 6, returns: 12, savings: 500000 },
    { label: '🎓 Child\'s Education', cost: 2000000, years: 12, inflation: 7, returns: 12, savings: 150000 },
    { label: '👴 Retirement', cost: 15000000, years: 25, inflation: 6, returns: 12, savings: 300000 },
    { label: '✈️ Vacation', cost: 500000, years: 3, inflation: 5, returns: 8, savings: 50000 },
    { label: '⚙️ Custom', cost: 1000000, years: 10, inflation: 6, returns: 12, savings: 100000 }
];

export default function GoalPlanning() {
    const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
    
    // Sliders state
    const [cost, setCost] = useState(PRESETS[0].cost);
    const [years, setYears] = useState(PRESETS[0].years);
    const [inflation, setInflation] = useState(PRESETS[0].inflation);
    const [returns, setReturns] = useState(PRESETS[0].returns);
    const [savings, setSavings] = useState(PRESETS[0].savings);

    // Update state when preset changes
    const handlePresetChange = (preset) => {
        setSelectedPreset(preset);
        setCost(preset.cost);
        setYears(preset.years);
        setInflation(preset.inflation);
        setReturns(preset.returns);
        setSavings(preset.savings);
    };

    // Calculate outputs
    const result = useMemo(() => 
        calculateGoalPlanning(cost, inflation, years, returns, savings),
        [cost, inflation, years, returns, savings]
    );

    const segments = [
        { value: result.totalInvested, color: '#3b7ef8', label: 'Total Invested' },
        { value: result.returnsEarned > 0 ? result.returnsEarned : 0, color: '#10b981', label: 'Est. Gains' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">🎯 Goal Based Savings Planner</h1>
            <p className="calc-subtitle">Design your target goals with inflation indexing, and determine the exact monthly SIP investment needed to secure them.</p>

            {/* Presets Row */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-title">Select Goal Preset</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {PRESETS.map((preset, index) => (
                        <button
                            key={index}
                            onClick={() => handlePresetChange(preset)}
                            className={`strategy-tab ${selectedPreset.label === preset.label ? 'active' : ''}`}
                            style={{
                                padding: '10px 16px',
                                border: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                flex: '1 1 auto',
                                textAlign: 'center',
                                borderRadius: 'var(--radius-sm)'
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
                    <div className="card-title">Goal Parameters</div>
                    <SliderInput label="Present Cost of Goal" value={cost} onChange={setCost} min={10000} max={50000000} step={10000} unit="₹" />
                    <SliderInput label="Time to Achieve Goal" value={years} onChange={setYears} min={1} max={40} step={1} unit="Years" />
                    <SliderInput label="Expected Inflation Rate" value={inflation} onChange={setInflation} min={0} max={15} step={0.5} unit="%" />
                    <SliderInput label="Expected Annual Return" value={returns} onChange={setReturns} min={4} max={25} step={0.5} unit="%" />
                    <SliderInput label="Existing Savings for Goal" value={savings} onChange={setSavings} min={0} max={10000000} step={5000} unit="₹" />
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Projected Growth & Contributions</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(result.futureCost)} centerSub="Future Target Cost" />
                        <div className="chart-legend">
                            {segments.map((s, i) => (
                                <div className="legend-item" key={i}>
                                    <div className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-label">{s.label}</span>
                                    <span className="legend-value">{formatINR(s.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Result Cards ── */}
            <div className="results-grid">
                <div className="result-card highlight">
                    <div className="result-label">Required Monthly SIP</div>
                    <div className="result-value accent">₹{formatNumber(result.monthlySIP)}/mo</div>
                    <div className="result-sub">To build remaining corpus</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Future Cost of Goal</div>
                    <div className="result-value success">₹{formatNumber(result.futureCost)}</div>
                    <div className="result-sub">Indexed at {inflation}% inflation</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Existing Savings FV</div>
                    <div className="result-value">₹{formatNumber(result.fvSavings)}</div>
                    <div className="result-sub">Grows at {returns}% per annum</div>
                </div>
            </div>

            {/* ── Goal Growth Schedule Table ── */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Year-wise Growth Breakdown & Target Cost Progression</div>
                <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Goal Cost (with Inflation)</th>
                                <th>Accumulated Savings (Savings + SIP)</th>
                                <th>Total Invested</th>
                                <th>Status / Coverage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.yearlyBreakdown.map(row => {
                                const coveragePercent = Math.min(100, Math.round((row.accumulated / row.targetCost) * 100));
                                return (
                                    <tr key={row.year}>
                                        <td>Year {row.year}</td>
                                        <td>₹{formatNumber(row.targetCost)}</td>
                                        <td>₹{formatNumber(row.accumulated)}</td>
                                        <td>₹{formatNumber(row.invested)}</td>
                                        <td>
                                            <span style={{ 
                                                fontWeight: 700, 
                                                color: coveragePercent >= 100 ? 'var(--accent-success)' : coveragePercent >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)' 
                                            }}>
                                                {coveragePercent}% Covered
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Goal-Based Planning</strong> helps you avoid savings shortfalls by indexing today's cost against price inflation. Your goal that costs ₹{formatNumber(cost)} today will cost ₹{formatNumber(result.futureCost)} in {years} years. With your existing savings growing to ₹{formatNumber(result.fvSavings)}, a monthly SIP of ₹{formatNumber(result.monthlySIP)} handles the remaining gap.
            </div>
        </div>
    );
}
