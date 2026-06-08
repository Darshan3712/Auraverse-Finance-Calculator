import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateEducationPlanning, formatINR, formatNumber } from '../../utils/calculations';

export default function ChildrenEducation() {
    const [currentCost, setCurrentCost] = useState(2000000); // e.g. ₹20L today
    const [inflationRate, setInflationRate] = useState(8);
    const [childAge, setChildAge] = useState(5);
    const [educationAge, setEducationAge] = useState(18); // when education starts
    const [expectedReturn, setExpectedReturn] = useState(12);

    const yearsToNeed = educationAge - childAge;

    const result = useMemo(() =>
        calculateEducationPlanning(currentCost, inflationRate, Math.max(1, yearsToNeed), expectedReturn),
        [currentCost, inflationRate, yearsToNeed, expectedReturn]
    );

    const segments = [
        { value: result.totalInvested, color: '#4f8ef7', label: 'Total Invested' },
        { value: result.returnsEarned, color: '#10b981', label: 'Returns / Growth' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">👶 Children's Education Planning</h1>
            <p className="calc-subtitle">Education costs rise faster than inflation. Calculate how much to invest monthly today to fund your child's future education.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Planning Details</div>
                    <SliderInput label="Current Education Cost (Today's ₹)" value={currentCost} onChange={setCurrentCost} min={100000} max={10000000} step={100000} unit="₹" />
                    <SliderInput label="Education Inflation Rate" value={inflationRate} onChange={setInflationRate} min={5} max={15} step={0.5} unit="%" />
                    <SliderInput label="Child's Current Age" value={childAge} onChange={setChildAge} min={0} max={15} step={1} unit="Years" />
                    <SliderInput label="Age When Education Starts" value={educationAge} onChange={setEducationAge} min={childAge + 2} max={25} step={1} unit="Years" />
                    <SliderInput label="Expected Investment Return" value={expectedReturn} onChange={setExpectedReturn} min={6} max={18} step={0.5} unit="%" />
                </div>

                <div className="card">
                    <div className="card-title">Investment Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32}
                            centerLabel={formatINR(result.futureCost)} centerSub="Future Cost" />
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
                    <div className="result-label">Monthly SIP Needed</div>
                    <div className="result-value accent">₹{formatNumber(result.monthlySIP)}</div>
                    <div className="result-sub">Start investing now</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Future Education Cost</div>
                    <div className="result-value warning">{formatINR(result.futureCost)}</div>
                    <div className="result-sub">In {Math.max(1, yearsToNeed)} years at {inflationRate}% inflation</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Returns Earned</div>
                    <div className="result-value success">{formatINR(result.returnsEarned)}</div>
                    <div className="result-sub">Market growth contribution</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Why plan early?</strong> Education inflation in India runs at 8–12% p.a. A ₹20L cost today becomes {formatINR(result.futureCost)} in {Math.max(1, yearsToNeed)} years. Starting SIP early dramatically reduces the monthly burden. Use Children's Mutual Fund Folios, Sukanya Samriddhi Yojana (for girls), or ULIP education plans.
            </div>
        </div>
    );
}
