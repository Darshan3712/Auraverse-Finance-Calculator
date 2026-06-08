import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateRealEstate, formatINR, formatNumber } from '../../utils/calculations';

export default function RealEstate() {
    const [purchasePrice, setPurchasePrice] = useState(5000000);
    const [appreciationRate, setAppreciationRate] = useState(8);
    const [years, setYears] = useState(10);
    const [monthlyRent, setMonthlyRent] = useState(20000);
    const [stampDuty, setStampDuty] = useState(5); // % stamp duty + registration

    const result = useMemo(() => calculateRealEstate(purchasePrice, appreciationRate, years, monthlyRent), [purchasePrice, appreciationRate, years, monthlyRent]);
    const totalCost = useMemo(() => purchasePrice + Math.round(purchasePrice * stampDuty / 100), [purchasePrice, stampDuty]);

    const segments = [
        { value: result.capitalGain, color: '#4f8ef7', label: 'Capital Appreciation' },
        { value: result.totalRentalIncome, color: '#10b981', label: 'Rental Income' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">🏘️ Real Estate Investment Calculator</h1>
            <p className="calc-subtitle">Estimate your property's capital appreciation and rental income to understand the total real estate ROI.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Property Details</div>
                    <SliderInput label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} min={500000} max={50000000} step={100000} unit="₹" />
                    <SliderInput label="Annual Appreciation Rate" value={appreciationRate} onChange={setAppreciationRate} min={2} max={20} step={0.5} unit="%" />
                    <SliderInput label="Holding Period" value={years} onChange={setYears} min={1} max={30} step={1} unit="Years" />
                    <SliderInput label="Expected Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} min={0} max={200000} step={1000} unit="₹" />
                    <SliderInput label="Stamp Duty + Registration" value={stampDuty} onChange={setStampDuty} min={1} max={10} step={0.5} unit="%" />
                </div>

                <div className="card">
                    <div className="card-title">Return Components</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32}
                            centerLabel={formatINR(result.totalReturn)} centerSub="Total Return" />
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
                    <div className="result-label">Future Property Value</div>
                    <div className="result-value accent">{formatINR(result.futureValue)}</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Investment Cost</div>
                    <div className="result-value">₹{formatNumber(totalCost)}</div>
                    <div className="result-sub">Incl. Stamp Duty {stampDuty}%</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Annualized Return</div>
                    <div className="result-value success">{result.annualizedReturn}%</div>
                    <div className="result-sub">Capital appreciation only</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Rental Yield</div>
                    <div className="result-value warning">{((monthlyRent * 12 / purchasePrice) * 100).toFixed(2)}%</div>
                    <div className="result-sub">Gross annual yield</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Rental Income</div>
                    <div className="result-value">{formatINR(result.totalRentalIncome)}</div>
                    <div className="result-sub">Over {years} years</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Returns</div>
                    <div className="result-value">{formatINR(result.totalReturn)}</div>
                    <div className="result-sub">Capital + Rental</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Real Estate ROI:</strong> Total return = Capital Appreciation + Rental Income. A good rental yield in India is 2–4% in metros. Note: Maintenance costs, property tax, and vacancy periods will reduce actual returns. Long-term capital gains (over 2 yrs) taxed at 20% with indexation benefits.
            </div>
        </div>
    );
}
