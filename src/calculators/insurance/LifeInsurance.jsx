import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateLifeInsurance, formatINR, formatNumber } from '../../utils/calculations';

export default function LifeInsurance() {
    const [age, setAge] = useState(30);
    const [annualIncome, setAnnualIncome] = useState(800000);
    const [retirementAge, setRetirementAge] = useState(60);
    const [existingDebts, setExistingDebts] = useState(2000000);
    const [annualExpenses, setAnnualExpenses] = useState(600000);

    const result = useMemo(() =>
        calculateLifeInsurance(age, annualIncome, retirementAge, existingDebts, annualExpenses),
        [age, annualIncome, retirementAge, existingDebts, annualExpenses]
    );

    const segments = [
        { value: result.hlvCover, color: '#4f8ef7', label: 'HLV Method' },
        { value: result.incomeReplacementCover, color: '#7c3aed', label: '10x Income Method' },
        { value: result.needsBasedCover, color: '#10b981', label: 'Needs-Based Method' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">🛡️ Life Insurance Calculator</h1>
            <p className="calc-subtitle">Calculate how much life cover you need using 3 industry methods — Human Life Value, Income Replacement, and Needs-Based.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Your Details</div>
                    <SliderInput label="Current Age" value={age} onChange={setAge} min={18} max={65} step={1} unit="Years" />
                    <SliderInput label="Annual Income" value={annualIncome} onChange={setAnnualIncome} min={100000} max={10000000} step={50000} unit="₹" />
                    <SliderInput label="Retirement Age" value={retirementAge} onChange={setRetirementAge} min={50} max={70} step={1} unit="Years" />
                    <SliderInput label="Existing Debts & Liabilities" value={existingDebts} onChange={setExistingDebts} min={0} max={20000000} step={100000} unit="₹" />
                    <SliderInput label="Annual Family Expenses" value={annualExpenses} onChange={setAnnualExpenses} min={100000} max={5000000} step={50000} unit="₹" />
                </div>

                <div className="card">
                    <div className="card-title">Coverage by Method</div>
                    <div className="chart-section" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
                        <div className="method-grid" style={{ width: '100%' }}>
                            <div className="method-card">
                                <div className="method-name">HLV Method</div>
                                <div className="method-value">{formatINR(result.hlvCover)}</div>
                            </div>
                            <div className="method-card">
                                <div className="method-name">10x Income</div>
                                <div className="method-value">{formatINR(result.incomeReplacementCover)}</div>
                            </div>
                            <div className="method-card" style={{ borderColor: 'rgba(79,142,247,0.3)' }}>
                                <div className="method-name">Needs-Based</div>
                                <div className="method-value">{formatINR(result.needsBasedCover)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="results-grid">
                <div className="result-card highlight" style={{ gridColumn: 'span 1' }}>
                    <div className="result-label">Recommended Cover</div>
                    <div className="result-value accent">{formatINR(result.recommendedCover)}</div>
                    <div className="result-sub">Highest of all methods</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Est. Annual Premium</div>
                    <div className="result-value warning">{formatINR(result.estimatedPremium)}</div>
                    <div className="result-sub">Term plan estimate</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Monthly Premium</div>
                    <div className="result-value">₹{formatNumber(Math.round(result.estimatedPremium / 12))}</div>
                    <div className="result-sub">Approx. for term plan</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Which method to choose?</strong> Most experts recommend the <strong>highest coverage</strong> among all 3 methods. A pure <strong>term plan</strong> is the most affordable for maximum coverage. The premium estimate is based on age — younger buyers get significantly cheaper rates. Always compare from PolicyBazaar, Ditto, or Coverfox.
            </div>
        </div>
    );
}
