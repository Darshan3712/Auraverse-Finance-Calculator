import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateTaxPlanning, formatINR, formatNumber } from '../../utils/calculations';

export default function TaxPlanning() {
    const [grossSalary, setGrossSalary] = useState(1200000);
    const [otherIncome, setOtherIncome] = useState(50000);
    const [deduction80C, setDeduction80C] = useState(150000);
    const [deduction80D, setDeduction80D] = useState(25000);
    const [homeLoanInterest, setHomeLoanInterest] = useState(0);
    const [otherDeductions, setOtherDeductions] = useState(50000);

    const result = useMemo(() => {
        return calculateTaxPlanning(
            grossSalary,
            otherIncome,
            deduction80C,
            deduction80D,
            homeLoanInterest,
            otherDeductions
        );
    }, [grossSalary, otherIncome, deduction80C, deduction80D, homeLoanInterest, otherDeductions]);

    const recommendedTax = result.recommendedRegime === 'New Tax Regime' ? result.new : result.old;
    const recommendedCess = result.recommendedRegime === 'New Tax Regime' ? result.newRegimeCess : result.oldRegimeCess;
    const recommendedTotalTax = result.recommendedRegime === 'New Tax Regime' ? result.new : result.old;

    const takeHome = Math.max(0, result.grossIncome - recommendedTotalTax);

    const segments = [
        { value: takeHome, color: '#10b981', label: 'Take Home Salary' },
        { value: recommendedTotalTax > 0 ? recommendedTotalTax : 0.001, color: '#ef4444', label: 'Total Tax' }
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">📝 Tax Planner (Old vs New Regime)</h1>
            <p className="calc-subtitle">Compare your tax liabilities under the Old and New tax regimes for FY 2025-26 / FY 2026-27 and structure your savings.</p>

            {/* Recommendation Banner */}
            <div className="card highlight" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'linear-gradient(135deg, rgba(46, 58, 140, 0.15), rgba(212, 175, 55, 0.15))' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>💡 AuraVerse Financial Recommendation</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px', textAlign: 'center' }}>
                    Choose the <strong>{result.recommendedRegime}</strong>
                </div>
                {result.taxSaved > 0 ? (
                    <div style={{ fontSize: '13px', color: 'var(--accent-success)', fontWeight: 700, marginTop: '2px' }}>
                        🎉 You will save ₹{formatNumber(result.taxSaved)} in taxes annually!
                    </div>
                ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Both regimes yield identical tax liabilities for your profile.
                    </div>
                )}
            </div>

            <div className="calc-grid">
                {/* ── LEFT: Inputs ── */}
                <div className="card">
                    <div className="card-title">Income & Tax-Saving Details</div>
                    <SliderInput label="Gross Annual Salary" value={grossSalary} onChange={setGrossSalary} min={100000} max={10000000} step={50000} unit="₹" />
                    <SliderInput label="Income from Other Sources" value={otherIncome} onChange={setOtherIncome} min={0} max={5000000} step={10000} unit="₹" />
                    <SliderInput label="Section 80C Investments" value={deduction80C} onChange={setDeduction80C} min={0} max={250000} step={5000} unit="₹" />
                    <SliderInput label="Section 80D (Health Premium)" value={deduction80D} onChange={setDeduction80D} min={0} max={100000} step={1000} unit="₹" />
                    <SliderInput label="Home Loan Interest (24b)" value={homeLoanInterest} onChange={setHomeLoanInterest} min={0} max={1000000} step={10000} unit="₹" />
                    <SliderInput label="Other Exemptions (HRA, LTA)" value={otherDeductions} onChange={setOtherDeductions} min={0} max={1000000} step={10000} unit="₹" />
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Income Split (Based on {result.recommendedRegime})</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(takeHome)} centerSub="Take Home Pay" />
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

                    <div className="section-divider" />
                    <div className="card-title">Regime Summary</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Gross Income:</span>
                            <strong>{formatINR(result.grossIncome)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Taxable Income (Old):</span>
                            <span>{formatINR(result.oldTaxableIncome)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Taxable Income (New):</span>
                            <span>{formatINR(result.newTaxableIncome)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Regime Comparison Cards ── */}
            <div className="results-grid">
                <div className="result-card">
                    <div className="result-label">Old Regime Tax</div>
                    <div className="result-value">₹{formatNumber(result.oldTax)}</div>
                    <div className="result-sub">Standard ₹50,000 Ded + 80C + 80D</div>
                </div>
                <div className="result-card highlight">
                    <div className="result-label">New Regime Tax</div>
                    <div className="result-value accent">₹{formatNumber(result.newTax)}</div>
                    <div className="result-sub">Standard ₹75,000 Ded (no other ded)</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Tax Savings</div>
                    <div className="result-value success">₹{formatNumber(result.taxSaved)}</div>
                    <div className="result-sub">Annually saved</div>
                </div>
            </div>

            {/* ── Slab Details Side by Side ── */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Tax Regime Comparison Table</div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Old Regime</th>
                                <th>New Regime</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Gross Income</td>
                                <td>₹{formatNumber(result.grossIncome)}</td>
                                <td>₹{formatNumber(result.grossIncome)}</td>
                            </tr>
                            <tr>
                                <td>Standard Deduction</td>
                                <td>₹50,000</td>
                                <td>₹75,000</td>
                            </tr>
                            <tr>
                                <td>Sec 80C Deduction (Capped)</td>
                                <td>₹{formatNumber(Math.min(150000, deduction80C))}</td>
                                <td>₹0 (Not allowed)</td>
                            </tr>
                            <tr>
                                <td>Sec 80D Deduction (Capped)</td>
                                <td>₹{formatNumber(Math.min(25000, deduction80D))}</td>
                                <td>₹0 (Not allowed)</td>
                            </tr>
                            <tr>
                                <td>Home Loan Interest (Capped)</td>
                                <td>₹{formatNumber(Math.min(200000, homeLoanInterest))}</td>
                                <td>₹0 (Not allowed)</td>
                            </tr>
                            <tr>
                                <td>Other Deductions (HRA, LTA)</td>
                                <td>₹{formatNumber(otherDeductions)}</td>
                                <td>₹0 (Not allowed)</td>
                            </tr>
                            <tr style={{ fontWeight: 700, background: '#f8faff' }}>
                                <td>Net Taxable Income</td>
                                <td>₹{formatNumber(result.oldTaxableIncome)}</td>
                                <td>₹{formatNumber(result.newTaxableIncome)}</td>
                            </tr>
                            <tr style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                                <td>Total Income Tax (incl. 4% Cess)</td>
                                <td>₹{formatNumber(result.oldTax)}</td>
                                <td>₹{formatNumber(result.newTax)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Tax Planning Tip:</strong> The **New Tax Regime** offers lower slab rates and a higher rebate threshold (income up to ₹7 Lakhs is tax-exempt via rebate), but eliminates almost all deductions. Salaried employees receive a standard deduction of ₹75,000 under the New regime vs ₹50,000 under the Old regime. If you have high investments in ELSS, PPF, and home loans, the **Old Regime** might still yield lower tax liability. Use this planner to optimize your structure!
            </div>
        </div>
    );
}
