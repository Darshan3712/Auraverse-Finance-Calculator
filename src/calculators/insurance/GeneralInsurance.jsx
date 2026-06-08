import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateHealthInsurance, formatINR, formatNumber } from '../../utils/calculations';

export default function GeneralInsurance() {
    const [age, setAge] = useState(30);
    const [members, setMembers] = useState(2);
    const [coverAmount, setCoverAmount] = useState(500000);
    const [hasPreExisting, setHasPreExisting] = useState(false);

    const result = useMemo(() =>
        calculateHealthInsurance(age, members, coverAmount, hasPreExisting),
        [age, members, coverAmount, hasPreExisting]
    );

    const segments = [
        { value: result.basePremium, color: '#4f8ef7', label: 'Base Premium' },
        { value: result.gst, color: '#f59e0b', label: 'GST (18%)' },
    ];

    const coverInLakhs = (coverAmount / 100000).toFixed(0);

    return (
        <div className="calc-container">
            <h1 className="calc-title">🏥 Health / General Insurance Calculator</h1>
            <p className="calc-subtitle">Estimate your annual health insurance premium based on age, family size, and coverage amount. Rates based on industry benchmarks.</p>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Policy Details</div>
                    <SliderInput label="Eldest Member's Age" value={age} onChange={setAge} min={18} max={70} step={1} unit="Years" />
                    <SliderInput label="Number of Members" value={members} onChange={setMembers} min={1} max={6} step={1} unit="Members" />
                    <SliderInput label="Sum Insured" value={coverAmount} onChange={setCoverAmount} min={200000} max={5000000} step={100000} unit="₹" />

                    <div className="input-group" style={{ marginTop: 12 }}>
                        <label className="toggle-group" onClick={() => setHasPreExisting(!hasPreExisting)}>
                            <input type="checkbox" className="toggle-checkbox" checked={hasPreExisting} onChange={() => { }} />
                            <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>Pre-existing conditions (+30% loading)</span>
                        </label>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Premium Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32}
                            centerLabel={formatINR(result.totalPremium)} centerSub="Annual Premium" />
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
                    <div className="result-label">Annual Premium</div>
                    <div className="result-value accent">₹{formatNumber(result.totalPremium)}</div>
                    <div className="result-sub">Incl. 18% GST</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Monthly Cost</div>
                    <div className="result-value">₹{formatNumber(result.monthlyPremium)}</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Cover per Member</div>
                    <div className="result-value success">₹{coverInLakhs}L</div>
                    <div className="result-sub">Family floater plan</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>General Insurance includes:</strong> Health, Motor, Travel, Home, and more. For health insurance, a minimum of ₹5–10L cover is recommended for families. GST at 18% applies on health insurance premiums. Premiums up to ₹25,000/yr (₹50,000 for seniors) are tax-deductible under Section 80D.
            </div>
        </div>
    );
}
