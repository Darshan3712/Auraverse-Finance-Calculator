import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateEMI, generateAmortizationSchedule, formatINR, formatNumber } from '../../utils/calculations';

export default function HomeLoan() {
    const [loanAmount, setLoanAmount] = useState(5000000);
    const [rate, setRate] = useState(8.5);
    const [tenure, setTenure] = useState(20);

    const result = useMemo(() => calculateEMI(loanAmount, rate, tenure), [loanAmount, rate, tenure]);
    const schedule = useMemo(() => generateAmortizationSchedule(loanAmount, rate, tenure), [loanAmount, rate, tenure]);

    const segments = [
        { value: loanAmount, color: '#4f8ef7', label: 'Principal' },
        { value: result.totalInterest, color: '#7c3aed', label: 'Total Interest' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">🏡 Home Loan Calculator</h1>
            <p className="calc-subtitle">Calculate your EMI, total interest payable, and view the full amortization schedule.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Loan Details</div>
                    <SliderInput label="Loan Amount" value={loanAmount} onChange={setLoanAmount} min={100000} max={50000000} step={100000} unit="₹" />
                    <SliderInput label="Annual Interest Rate" value={rate} onChange={setRate} min={5} max={20} step={0.1} unit="%" />
                    <SliderInput label="Loan Tenure" value={tenure} onChange={setTenure} min={1} max={30} step={1} unit="Years" />
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
                    <div className="result-label">Total Interest</div>
                    <div className="result-value warning">₹{formatNumber(result.totalInterest)}</div>
                    <div className="result-sub">{((result.totalInterest / loanAmount) * 100).toFixed(1)}% of principal</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Payment</div>
                    <div className="result-value success">₹{formatNumber(result.totalAmount)}</div>
                    <div className="result-sub">Over {tenure} years</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Formula:</strong> EMI = [P × r × (1+r)^n] / [(1+r)^n – 1] — where P = Principal, r = Monthly interest rate, n = Tenure in months. Home loans typically offer the lowest rates due to collateral.
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
