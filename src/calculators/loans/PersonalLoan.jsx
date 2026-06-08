import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateEMI, formatINR, formatNumber } from '../../utils/calculations';

export default function PersonalLoan() {
    const [loanAmount, setLoanAmount] = useState(500000);
    const [rate, setRate] = useState(14);
    const [tenure, setTenure] = useState(3);

    const result = useMemo(() => calculateEMI(loanAmount, rate, tenure), [loanAmount, rate, tenure]);

    // Monthly income needed (EMI should not exceed 40-50% of take-home)
    const minIncomeNeeded = Math.round(result.emi / 0.4);
    const interestRatio = ((result.totalInterest / loanAmount) * 100).toFixed(1);

    const segments = [
        { value: loanAmount, color: '#4f8ef7', label: 'Principal' },
        { value: result.totalInterest, color: '#ef4444', label: 'Total Interest' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">💳 Personal Loan Calculator</h1>
            <p className="calc-subtitle">Unsecured loan with higher rates. Calculate EMI and assess affordability based on your income.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Loan Details</div>
                    <SliderInput label="Loan Amount" value={loanAmount} onChange={setLoanAmount} min={10000} max={5000000} step={10000} unit="₹" />
                    <SliderInput label="Annual Interest Rate" value={rate} onChange={setRate} min={10} max={30} step={0.25} unit="%" />
                    <SliderInput label="Loan Tenure" value={tenure} onChange={setTenure} min={1} max={7} step={1} unit="Years" />
                </div>

                <div className="card">
                    <div className="card-title">Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(result.emi)} centerSub="Monthly EMI" />
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
                </div>
                <div className="result-card" style={{ borderColor: parseInt(interestRatio) > 50 ? 'rgba(239,68,68,0.3)' : undefined }}>
                    <div className="result-label">Interest Burden</div>
                    <div className="result-value warning">{interestRatio}%</div>
                    <div className="result-sub">of principal amount</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Min. Income Needed</div>
                    <div className="result-value">₹{formatNumber(minIncomeNeeded)}</div>
                    <div className="result-sub">/month (40% EMI rule)</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>40% Rule:</strong> Banks typically approve personal loans only if your EMI-to-income ratio is below 40–50%. At ₹{formatNumber(result.emi)}/month EMI, you need at least ₹{formatNumber(minIncomeNeeded)}/month income. Personal loans have higher rates since they are unsecured.
            </div>
        </div>
    );
}
