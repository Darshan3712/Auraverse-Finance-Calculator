import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateEMI, generateAmortizationSchedule, formatINR, formatNumber } from '../../utils/calculations';

export default function LoanAgainstProperty() {
    const [loanAmount, setLoanAmount] = useState(3000000); // Default 30 Lakhs
    const [rate, setRate] = useState(9.5); // Default 9.5%
    const [tenure, setTenure] = useState(15); // Default 15 Years

    const result = useMemo(() => calculateEMI(loanAmount, rate, tenure), [loanAmount, rate, tenure]);
    const schedule = useMemo(() => generateAmortizationSchedule(loanAmount, rate, tenure), [loanAmount, rate, tenure]);

    const segments = [
        { value: loanAmount, color: '#4f8ef7', label: 'Principal' },
        { value: result.totalInterest, color: '#7c3aed', label: 'Total Interest' },
    ];

    const interestRatio = ((result.totalInterest / loanAmount) * 100).toFixed(1);

    return (
        <div className="calc-container">
            <h1 className="calc-title">🏢 Loan Against Property</h1>
            <p className="calc-subtitle">Mortgage loan secured by your property. Get lower rates and higher loan amounts by leveraging your real estate assets.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Loan Details</div>
                    <SliderInput label="Loan Amount" value={loanAmount} onChange={setLoanAmount} min={100000} max={100000000} step={100000} unit="₹" />
                    <SliderInput label="Annual Interest Rate" value={rate} onChange={setRate} min={8.0} max={18.0} step={0.1} unit="%" />
                    <SliderInput label="Loan Tenure" value={tenure} onChange={setTenure} min={1} max={15} step={1} unit="Years" />
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
                <div className="result-card">
                    <div className="result-label">Interest Burden</div>
                    <div className="result-value warning">{interestRatio}%</div>
                    <div className="result-sub">of principal amount</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Payment</div>
                    <div className="result-value success">₹{formatNumber(result.totalAmount)}</div>
                    <div className="result-sub">Over {tenure} years</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Property Collateral:</strong> Loan Against Property (LAP) is a secured loan, meaning interest rates are significantly lower than personal loans. Banks typically offer up to 50% - 70% of the market value of your property (LTV ratio) as a loan.
            </div>

            <div className="table-section card" style={{ marginTop: 20 }}>
                <div className="table-title">Year-wise Amortization Schedule</div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Principal Paid</th>
                                <th>Interest Paid</th>
                                <th>Total Paid</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedule.map((row) => (
                                <tr key={row.year}>
                                    <td>Year {row.year}</td>
                                    <td>₹{formatNumber(row.principal)}</td>
                                    <td>₹{formatNumber(row.interest)}</td>
                                    <td>₹{formatNumber(row.principal + row.interest)}</td>
                                    <td>₹{formatNumber(row.balance)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
