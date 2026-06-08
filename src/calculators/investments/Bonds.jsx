import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateBond, formatINR, formatNumber } from '../../utils/calculations';

export default function Bonds() {
    const [faceValue, setFaceValue] = useState(100000);
    const [purchasePrice, setPurchasePrice] = useState(95000);
    const [couponRate, setCouponRate] = useState(8);
    const [years, setYears] = useState(5);
    const [frequency, setFrequency] = useState(1); // Annual payout by default

    const result = useMemo(() =>
        calculateBond(faceValue, purchasePrice, couponRate, years, frequency),
        [faceValue, purchasePrice, couponRate, years, frequency]
    );

    const segments = [
        { value: purchasePrice, color: '#3b7ef8', label: 'Purchase Price' },
        { value: result.totalInterest, color: '#10b981', label: 'Total Payouts (Interest)' },
    ];

    const freqLabels = { 1: 'Annually', 2: 'Semi-Annually', 4: 'Quarterly', 12: 'Monthly' };

    return (
        <div className="calc-container">
            <h1 className="calc-title">📈 Bonds Yield & Return Calculator</h1>
            <p className="calc-subtitle">Estimate yield metrics like Yield to Maturity (YTM) and Current Yield, and visualize future bond coupon cashflows.</p>

            <div className="calc-grid">
                {/* ── LEFT: Inputs ── */}
                <div className="card">
                    <div className="card-title">Bond Details</div>
                    <SliderInput label="Face Value (Par Value)" value={faceValue} onChange={setFaceValue} min={1000} max={10000000} step={1000} unit="₹" />
                    <SliderInput label="Purchase / Market Price" value={purchasePrice} onChange={setPurchasePrice} min={500} max={12000000} step={500} unit="₹" />
                    <SliderInput label="Annual Coupon Rate" value={couponRate} onChange={setCouponRate} min={1} max={25} step={0.25} unit="%" />
                    <SliderInput label="Tenure to Maturity" value={years} onChange={setYears} min={1} max={30} step={1} unit="Years" />

                    <div className="input-group">
                        <label className="input-label">Payout Frequency</label>
                        <select className="select-field" value={frequency} onChange={e => setFrequency(Number(e.target.value))}>
                            <option value={1}>Annually</option>
                            <option value={2}>Semi-Annually</option>
                            <option value={4}>Quarterly</option>
                            <option value={12}>Monthly</option>
                        </select>
                    </div>
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Asset Allocation / Growth</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(faceValue + result.totalInterest)} centerSub="Total Returns" />
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
                    <div className="result-label">Yield to Maturity (YTM)</div>
                    <div className="result-value accent">{result.ytm}%</div>
                    <div className="result-sub">Internal Rate of Return (IRR)</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Current Yield</div>
                    <div className="result-value success">{result.currentYield}%</div>
                    <div className="result-sub">Annual Interest / Purchase Price</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Gains</div>
                    <div className="result-value">₹{formatNumber(result.totalGain)}</div>
                    <div className="result-sub">Interest + Face Value - Purchase Price</div>
                </div>
            </div>

            {/* ── Cash Flow Payouts Table ── */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Coupon Cash Flow Schedule ({freqLabels[frequency]} Payouts)</div>
                <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Payout Period</th>
                                <th>Year</th>
                                <th>Payout Amount</th>
                                <th>Cumulative Interest</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.schedule.map(row => (
                                <tr key={row.period}>
                                    <td>Payout #{row.period}</td>
                                    <td>Year {row.year}</td>
                                    <td>₹{formatNumber(row.payout)}</td>
                                    <td style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                        ₹{formatNumber(row.cumulative)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Yield to Maturity (YTM)</strong> is the total return anticipated on a bond if it is held until maturity. When purchase price is lower than face value (discounted), YTM is higher than the coupon rate. If purchase price is higher than face value (premium), YTM is lower than the coupon rate.
            </div>
        </div>
    );
}
