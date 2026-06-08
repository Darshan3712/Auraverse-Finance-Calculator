import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateEMI, formatINR, formatNumber } from '../../utils/calculations';

export default function BusinessLoan() {
    const [loanAmount, setLoanAmount] = useState(3000000);
    const [rate, setRate] = useState(12);
    const [tenure, setTenure] = useState(5);
    const [processingFee, setProcessingFee] = useState(2); // % of loan

    const result = useMemo(() => calculateEMI(loanAmount, rate, tenure), [loanAmount, rate, tenure]);
    const processingFeeAmt = useMemo(() => Math.round(loanAmount * processingFee / 100), [loanAmount, processingFee]);
    const effectiveCost = useMemo(() => result.totalAmount + processingFeeAmt, [result.totalAmount, processingFeeAmt]);

    const segments = [
        { value: loanAmount, color: '#4f8ef7', label: 'Principal' },
        { value: result.totalInterest, color: '#7c3aed', label: 'Total Interest' },
        { value: processingFeeAmt, color: '#10b981', label: 'Processing Fee' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">🏢 Business Loan Calculator</h1>
            <p className="calc-subtitle">Calculate EMI for business loans including processing fees to understand the true total cost of borrowing.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Loan Details</div>
                    <SliderInput label="Loan Amount" value={loanAmount} onChange={setLoanAmount} min={100000} max={50000000} step={100000} unit="₹" />
                    <SliderInput label="Annual Interest Rate" value={rate} onChange={setRate} min={8} max={24} step={0.25} unit="%" />
                    <SliderInput label="Loan Tenure" value={tenure} onChange={setTenure} min={1} max={15} step={1} unit="Years" />
                    <SliderInput label="Processing Fee" value={processingFee} onChange={setProcessingFee} min={0} max={5} step={0.25} unit="%" />
                </div>

                <div className="card">
                    <div className="card-title">Cost Breakup</div>
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
                <div className="result-card">
                    <div className="result-label">Processing Fee</div>
                    <div className="result-value warning">₹{formatNumber(processingFeeAmt)}</div>
                    <div className="result-sub">One-time charge</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Effective Cost</div>
                    <div className="result-value success">₹{formatNumber(effectiveCost)}</div>
                    <div className="result-sub">EMIs + processing fee</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Business Loan Tip:</strong> Compare the Effective Annual Rate (EAR) across lenders — processing fees, foreclosure charges, and insurance can significantly raise your true borrowing cost beyond the advertised rate.
            </div>
        </div>
    );
}
