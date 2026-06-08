import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateRetirementPlanning, formatINR, formatNumber } from '../../utils/calculations';

export default function RetirementPlanning() {
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(60);
    const [currentExpenses, setCurrentExpenses] = useState(50000);
    const [inflationRate, setInflationRate] = useState(6);
    const [expectedReturn, setExpectedReturn] = useState(12);
    const [postRetirementReturn, setPostRetirementReturn] = useState(7);

    const result = useMemo(() =>
        calculateRetirementPlanning(currentAge, retirementAge, currentExpenses, inflationRate, expectedReturn, postRetirementReturn),
        [currentAge, retirementAge, currentExpenses, inflationRate, expectedReturn, postRetirementReturn]
    );

    const segments = [
        { value: result.monthlySIP * result.yearsToRetirement * 12, color: '#4f8ef7', label: 'Total SIP Investment' },
        { value: result.corpusNeeded - (result.monthlySIP * result.yearsToRetirement * 12), color: '#10b981', label: 'Growth / Returns' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">👴 Retirement Planning Calculator</h1>
            <p className="calc-subtitle">Plan for a financially independent retirement. We calculate your retirement corpus and the monthly SIP you need to start today.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Retirement Details</div>
                    <SliderInput label="Current Age" value={currentAge} onChange={setCurrentAge} min={20} max={60} step={1} unit="Years" />
                    <SliderInput label="Desired Retirement Age" value={retirementAge} onChange={setRetirementAge} min={currentAge + 5} max={70} step={1} unit="Years" />
                    <SliderInput label="Monthly Expenses (Today)" value={currentExpenses} onChange={setCurrentExpenses} min={10000} max={500000} step={5000} unit="₹/mo" />
                    <SliderInput label="Inflation Rate" value={inflationRate} onChange={setInflationRate} min={3} max={10} step={0.5} unit="%" />
                    <SliderInput label="Pre-Retirement Return" value={expectedReturn} onChange={setExpectedReturn} min={6} max={20} step={0.5} unit="%" />
                    <SliderInput label="Post-Retirement Return" value={postRetirementReturn} onChange={setPostRetirementReturn} min={4} max={10} step={0.25} unit="%" />
                </div>

                <div className="card">
                    <div className="card-title">Corpus Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32}
                            centerLabel={formatINR(result.corpusNeeded)} centerSub="Corpus Needed" />
                        <div className="chart-legend">
                            {segments.map((s, i) => (
                                <div className="legend-item" key={i}>
                                    <div className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-label">{s.label}</span>
                                    <span className="legend-value">{formatINR(Math.max(0, s.value))}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="results-grid">
                <div className="result-card highlight">
                    <div className="result-label">Monthly SIP Needed</div>
                    <div className="result-value accent">₹{formatNumber(result.monthlySIP)}</div>
                    <div className="result-sub">For {result.yearsToRetirement} years</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Retirement Corpus</div>
                    <div className="result-value warning">{formatINR(result.corpusNeeded)}</div>
                    <div className="result-sub">Total needed at {retirementAge}</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Monthly Expense at Retirement</div>
                    <div className="result-value">₹{formatNumber(result.futureMonthlyExpense)}</div>
                    <div className="result-sub">Inflation-adjusted</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Methodology:</strong> Based on the "4% Safe Withdrawal Rate" principle adjusted for Indian inflation. At retirement, the corpus earns post-retirement returns while being withdrawn inflation-adjustedly for {result.yearsInRetirement} years (till age 85). Increase SIP amount by 10% every year to match salary growth.
            </div>
        </div>
    );
}
