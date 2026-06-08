import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateEMI, formatINR, formatNumber } from '../../utils/calculations';

export default function EducationLoan() {
    const [loanAmount, setLoanAmount] = useState(1500000);
    const [rate, setRate] = useState(10.5);
    const [tenure, setTenure] = useState(7);
    const [moratorium, setMoratorium] = useState(2); // course + 1 yr grace

    const result = useMemo(() => calculateEMI(loanAmount, rate, tenure), [loanAmount, rate, tenure]);

    // Simple interest during moratorium
    const moratoriumInterest = useMemo(() => {
        return Math.round(loanAmount * (rate / 100) * moratorium);
    }, [loanAmount, rate, moratorium]);

    const segments = [
        { value: loanAmount, color: '#4f8ef7', label: 'Principal' },
        { value: result.totalInterest, color: '#7c3aed', label: 'Repayment Interest' },
        { value: moratoriumInterest, color: '#f59e0b', label: 'Moratorium Interest' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">🎓 Education Loan Calculator</h1>
            <p className="calc-subtitle">Plan your education loan with moratorium period (course duration + 1 year) — EMI starts after this period.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Loan Details</div>
                    <SliderInput label="Loan Amount" value={loanAmount} onChange={setLoanAmount} min={50000} max={7500000} step={50000} unit="₹" />
                    <SliderInput label="Annual Interest Rate" value={rate} onChange={setRate} min={7} max={18} step={0.1} unit="%" />
                    <SliderInput label="Repayment Tenure (after moratorium)" value={tenure} onChange={setTenure} min={1} max={15} step={1} unit="Years" />
                    <SliderInput label="Moratorium Period" value={moratorium} onChange={setMoratorium} min={1} max={5} step={1} unit="Years" />
                </div>

                <div className="card">
                    <div className="card-title">Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(result.emi)} centerSub="Post-Study EMI" />
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
                    <div className="result-label">Monthly EMI</div>
                    <div className="result-value accent">₹{formatNumber(result.emi)}</div>
                    <div className="result-sub">After moratorium</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Moratorium Interest</div>
                    <div className="result-value warning">₹{formatNumber(moratoriumInterest)}</div>
                    <div className="result-sub">Accrued, not paid</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Cost</div>
                    <div className="result-value success">₹{formatNumber(result.totalAmount + moratoriumInterest)}</div>
                    <div className="result-sub">Complete repayment</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Moratorium Period:</strong> During the course and up to 1 year after, you don't pay EMIs — but interest accrues (simple interest). You can choose to pay this interest to reduce your burden later. Banks like SBI, Axis, and HDFC offer education loans at competitive rates.
            </div>
        </div>
    );
}
