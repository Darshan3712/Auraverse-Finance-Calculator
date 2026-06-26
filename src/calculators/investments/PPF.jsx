import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculatePPF, formatINR, formatNumber } from '../../utils/calculations';

const PPF_RATE = 7.1; // Current government rate

const FREQUENCIES = [
    { id: 'monthly',      label: '1 Month',     icon: '📅' },
    { id: 'quarterly',    label: '3 Months',    icon: '🗓️' },
    { id: 'half-yearly',  label: '6 Months',    icon: '📆' },
    { id: 'yearly',       label: 'Yearly',      icon: '🌾' },
    { id: 'lumpsum',      label: 'One-Time',    icon: '💰' },
];

const FREQ_LIMITS = {
    monthly:       { min: 500,  max: 12500,  step: 100,  label: 'Monthly Deposit',                 unit: '₹/mo' },
    quarterly:     { min: 1500, max: 37500,  step: 500,  label: 'Quarterly Deposit (Every 3 Mo)',  unit: '₹/qtr' },
    'half-yearly': { min: 3000, max: 75000,  step: 1000, label: 'Half-Yearly Deposit (Every 6 Mo)', unit: '₹/6mo' },
    yearly:        { min: 500,  max: 150000, step: 500,  label: 'Yearly Deposit',                  unit: '₹/yr' },
    lumpsum:       { min: 500,  max: 150000, step: 500,  label: 'One-Time Deposit',                unit: '₹' },
};

const FREQ_DEFAULTS = {
    monthly: 12500,
    quarterly: 37500,
    'half-yearly': 75000,
    yearly: 150000,
    lumpsum: 150000,
};

function FreqTabs({ value, onChange }) {
    return (
        <div className="freq-tabs-row">
            {FREQUENCIES.map(f => (
                <button
                    key={f.id}
                    className={`freq-tab${value === f.id ? ' active' : ''}`}
                    onClick={() => onChange(f.id)}
                >
                    <span className="freq-tab-icon">{f.icon}</span>
                    {f.label}
                </button>
            ))}
        </div>
    );
}

export default function PPF() {
    const [frequency, setFrequency] = useState('yearly');
    const [deposit, setDeposit] = useState(FREQ_DEFAULTS.yearly);
    const [years, setYears] = useState(15);
    const [showTable, setShowTable] = useState(false);

    const handleFreqChange = (f) => {
        setFrequency(f);
        setDeposit(FREQ_DEFAULTS[f]);
    };

    const result = useMemo(() => {
        return calculatePPF(deposit, years, PPF_RATE, frequency);
    }, [deposit, years, frequency]);

    const segments = [
        { value: result.totalDeposited, color: '#4f8ef7', label: 'Total Deposited' },
        { value: result.totalInterest, color: '#10b981', label: 'Interest Earned' },
    ];

    const displayRows = showTable ? result.yearlyBreakdown : result.yearlyBreakdown.slice(0, 5);

    return (
        <div className="calc-container">
            <h1 className="calc-title">🛡️ PPF Calculator</h1>
            <p className="calc-subtitle">
                Public Provident Fund — Government-backed, tax-free returns at {PPF_RATE}% p.a. (current rate). Ideal for long-term, risk-free wealth building.
            </p>

            {/* Investment Frequency */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title">Investment Frequency</div>
                <FreqTabs value={frequency} onChange={handleFreqChange} />
            </div>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">PPF Details</div>
                    <SliderInput 
                        label={FREQ_LIMITS[frequency].label}
                        value={deposit} 
                        onChange={setDeposit} 
                        min={FREQ_LIMITS[frequency].min} 
                        max={FREQ_LIMITS[frequency].max} 
                        step={FREQ_LIMITS[frequency].step} 
                        unit={FREQ_LIMITS[frequency].unit} 
                    />
                    <SliderInput label="Investment Duration" value={years} onChange={setYears} min={15} max={50} step={1} unit="Years" />

                    <div className="info-box" style={{ marginTop: 12 }}>
                        <strong>Key PPF Facts:</strong><br />
                        • Current Rate: {PPF_RATE}% p.a. (tax-free)<br />
                        • Lock-in: 15 years (extendable by 5 yrs)<br />
                        • Max limit: ₹1.5 L/yr per account (across all deposits)<br />
                        • Section 80C benefit up to ₹1.5 L/yr
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(result.maturity)} centerSub="Maturity" />
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

            <div className="results-grid">
                <div className="result-card highlight">
                    <div className="result-label">Maturity Amount</div>
                    <div className="result-value accent">₹{formatNumber(result.maturity)}</div>
                    <div className="result-sub">Completely Tax-Free</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Deposited</div>
                    <div className="result-value">₹{formatNumber(result.totalDeposited)}</div>
                    <div className="result-sub">₹{formatNumber(deposit * (frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : frequency === 'half-yearly' ? 2 : 1))}/year</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Interest Earned</div>
                    <div className="result-value success">₹{formatNumber(result.totalInterest)}</div>
                    <div className="result-sub">Tax-free under EEE</div>
                </div>
            </div>

            {/* Year-wise growth breakdown */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Year-wise Growth Breakdown</div>
                <div style={{ overflowX: 'auto', maxHeight: showTable ? '360px' : undefined }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Deposited (Cumulative)</th>
                                <th>Interest Credited (Year)</th>
                                <th>Balance at End of Year</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayRows.map(row => (
                                <tr key={row.year}>
                                    <td>Year {row.year}</td>
                                    <td>₹{formatNumber(row.deposited)}</td>
                                    <td style={{ color: 'var(--accent-success)' }}>
                                        +₹{formatNumber(row.interest)}
                                    </td>
                                    <td style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                        ₹{formatNumber(row.balance)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {result.yearlyBreakdown.length > 5 && (
                    <button className="show-more-btn" onClick={() => setShowTable(v => !v)}>
                        {showTable ? '▲ Show Less' : `▼ Show All ${result.yearlyBreakdown.length} Years`}
                    </button>
                )}
            </div>

            <div className="info-box" style={{ marginTop: 20 }}>
                💡 <strong>EEE Status:</strong> PPF enjoys Exempt-Exempt-Exempt taxation — investment, interest, and maturity are all tax-free. Combined with Section 80C deduction of up to ₹1.5L/year, it's one of the most tax-efficient instruments for Indian investors.
            </div>
        </div>
    );
}
