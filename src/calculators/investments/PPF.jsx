import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculatePPF, formatINR, formatNumber } from '../../utils/calculations';

const PPF_RATE = 7.1; // Current government rate

export default function PPF() {
    const [yearlyDeposit, setYearlyDeposit] = useState(150000); // Max 1.5L/yr
    const [years, setYears] = useState(15); // Minimum 15 years

    const result = useMemo(() => calculatePPF(yearlyDeposit, years, PPF_RATE), [yearlyDeposit, years]);

    const segments = [
        { value: result.totalDeposited, color: '#4f8ef7', label: 'Total Deposited' },
        { value: result.totalInterest, color: '#10b981', label: 'Interest Earned' },
    ];

    // Year-by-year summary (just show some milestones)
    const yrs = Math.min(years, 15);
    const milestones = [5, 10, 15].filter(y => y <= years).map(y => ({
        year: y,
        value: Math.round(calculatePPF(yearlyDeposit, y, PPF_RATE).maturity),
    }));

    return (
        <div className="calc-container">
            <h1 className="calc-title">🛡️ PPF Calculator</h1>
            <p className="calc-subtitle">Public Provident Fund — Government-backed, tax-free returns at {PPF_RATE}% p.a. (current rate). Ideal for long-term, risk-free wealth building.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">PPF Details</div>
                    <SliderInput label="Yearly Deposit" value={yearlyDeposit} onChange={setYearlyDeposit} min={500} max={150000} step={500} unit="₹/yr" />
                    <SliderInput label="Investment Duration" value={years} onChange={setYears} min={15} max={50} step={1} unit="Years" />

                    <div className="info-box" style={{ marginTop: 12 }}>
                        <strong>Key PPF Facts:</strong><br />
                        • Current Rate: {PPF_RATE}% p.a. (tax-free)<br />
                        • Lock-in: 15 years (extendable by 5 yrs)<br />
                        • Max: ₹1.5 L/yr per account<br />
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
                </div>
                <div className="result-card success">
                    <div className="result-label">Interest Earned</div>
                    <div className="result-value success">₹{formatNumber(result.totalInterest)}</div>
                    <div className="result-sub">Tax-free under EEE</div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Growth Milestones</div>
                <div className="milestone-grid">
                    {milestones.map(m => (
                        <div className="milestone-card" key={m.year}>
                            <div className="milestone-year">Year {m.year}</div>
                            <div className="milestone-value">{formatINR(m.value)}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="info-box">
                💡 <strong>EEE Status:</strong> PPF enjoys Exempt-Exempt-Exempt taxation — investment, interest, and maturity are all tax-free. Combined with Section 80C deduction of up to ₹1.5L/year, it's one of the most tax-efficient instruments for Indian investors.
            </div>
        </div>
    );
}
