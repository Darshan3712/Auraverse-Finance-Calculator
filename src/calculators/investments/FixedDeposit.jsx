import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateFD, formatINR, formatNumber } from '../../utils/calculations';

export default function FixedDeposit() {
    const [principal, setPrincipal] = useState(100000);
    const [rate, setRate] = useState(7);
    const [years, setYears] = useState(5);
    const [compFreq, setCompFreq] = useState(4); // quarterly

    const result = useMemo(() => calculateFD(principal, rate, years, compFreq), [principal, rate, years, compFreq]);

    const segments = [
        { value: principal, color: '#4f8ef7', label: 'Principal' },
        { value: result.interest, color: '#10b981', label: 'Interest Earned' },
    ];

    const freqLabels = { 1: 'Annually', 2: 'Half-Yearly', 4: 'Quarterly', 12: 'Monthly' };

    return (
        <div className="calc-container">
            <h1 className="calc-title">🏦 Fixed Deposit Calculator</h1>
            <p className="calc-subtitle">Calculate maturity amount and interest earned on your FD with different compounding frequencies.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">FD Details</div>
                    <SliderInput label="Principal Amount" value={principal} onChange={setPrincipal} min={1000} max={10000000} step={1000} unit="₹" />
                    <SliderInput label="Annual Interest Rate" value={rate} onChange={setRate} min={4} max={10} step={0.25} unit="%" />
                    <SliderInput label="Tenure" value={years} onChange={setYears} min={1} max={10} step={1} unit="Years" />

                    <div className="input-group">
                        <label className="input-label">Compounding Frequency</label>
                        <select className="select-field" value={compFreq} onChange={e => setCompFreq(Number(e.target.value))}>
                            <option value={1}>Annually</option>
                            <option value={2}>Half-Yearly</option>
                            <option value={4}>Quarterly (Most Common)</option>
                            <option value={12}>Monthly</option>
                        </select>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32}
                            centerLabel={formatINR(result.maturity)} centerSub="Maturity" />
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
                </div>
                <div className="result-card success">
                    <div className="result-label">Total Interest</div>
                    <div className="result-value success">₹{formatNumber(result.interest)}</div>
                    <div className="result-sub">{freqLabels[compFreq]} compounding</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Effective Yield</div>
                    <div className="result-value">{((result.interest / principal / years) * 100).toFixed(2)}%</div>
                    <div className="result-sub">Per annum (effective)</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Formula:</strong> A = P × (1 + r/n)^(n×t) — where r = annual rate, n = compounding frequency, t = time in years. Higher compounding frequency = slightly more returns. FDs offer guaranteed returns unlike market-linked instruments.
            </div>
        </div>
    );
}
