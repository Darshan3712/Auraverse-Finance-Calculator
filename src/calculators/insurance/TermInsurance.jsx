import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateTermInsurance, formatINR, formatNumber } from '../../utils/calculations';

export default function TermInsurance() {
    const [age, setAge] = useState(30);
    const [gender, setGender] = useState('male');
    const [smoking, setSmoking] = useState('non-tobacco');
    const [sumAssured, setSumAssured] = useState(10000000); // 1 Crore default
    const [coverAge, setCoverAge] = useState(65);
    const [paymentTerm, setPaymentTerm] = useState(35); // regular pay
    const [frequency, setFrequency] = useState('monthly');

    // Riders State
    const [accidentalDeath, setAccidentalDeath] = useState(false);
    const [criticalIllness, setCriticalIllness] = useState(false);
    const [waiverOfPremium, setWaiverOfPremium] = useState(false);
    const [globalTravel, setGlobalTravel] = useState(false);

    // Policy term is Cover Till Age - Current Age
    const policyTerm = useMemo(() => Math.max(5, coverAge - age), [coverAge, age]);

    // Ensure payment term is not higher than policy term
    const adjustedPaymentTerm = useMemo(() => {
        return Math.min(paymentTerm, policyTerm);
    }, [paymentTerm, policyTerm]);

    const result = useMemo(() => {
        return calculateTermInsurance(
            age,
            gender,
            smoking,
            sumAssured,
            policyTerm,
            adjustedPaymentTerm,
            frequency,
            { accidentalDeath, criticalIllness, waiverOfPremium, globalTravel }
        );
    }, [age, gender, smoking, sumAssured, policyTerm, adjustedPaymentTerm, frequency, accidentalDeath, criticalIllness, waiverOfPremium, globalTravel]);

    const totalRidersCost = result.accidentalDeathPremium + result.criticalIllnessPremium + result.waiverOfPremiumCost + result.globalTravelPremium;

    const segments = [
        { value: result.basePremium, color: '#3b7ef8', label: 'Base Premium' },
        { value: totalRidersCost > 0 ? totalRidersCost : 0.001, color: '#7c3aed', label: 'Add-on Riders' }
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">🛡️ Term Life Insurance Calculator</h1>
            <p className="calc-subtitle">Secure your family's future with customizable term plans, custom pay options, and worldwide global travel coverage.</p>

            <div className="calc-grid">
                {/* ── LEFT: Inputs ── */}
                <div className="card">
                    <div className="card-title">Personal Profile & Policy Parameters</div>
                    
                    {/* Gender & Smoking Choice Toggles */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Gender</label>
                            <div className="strategy-tabs" style={{ marginTop: '4px' }}>
                                <button className={`strategy-tab ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>Male</button>
                                <button className={`strategy-tab ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>Female</button>
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Tobacco/Smoking</label>
                            <div className="strategy-tabs" style={{ marginTop: '4px' }}>
                                <button className={`strategy-tab ${smoking === 'non-tobacco' ? 'active' : ''}`} onClick={() => setSmoking('non-tobacco')}>No</button>
                                <button className={`strategy-tab ${smoking === 'tobacco' ? 'active' : ''}`} onClick={() => setSmoking('tobacco')}>Yes</button>
                            </div>
                        </div>
                    </div>

                    <SliderInput label="Your Current Age" value={age} onChange={setAge} min={18} max={65} step={1} unit="Years" />
                    <SliderInput label="Life Cover (Sum Assured)" value={sumAssured} onChange={setSumAssured} min={1000000} max={100000000} step={1000000} unit="₹" />
                    <SliderInput label="Cover Till Age" value={coverAge} onChange={setCoverAge} min={Math.max(25, age + 5)} max={85} step={1} unit="Years" />
                    <SliderInput label="Premium Payment Term (PPT)" value={adjustedPaymentTerm} onChange={setPaymentTerm} min={5} max={policyTerm} step={1} unit="Years" />

                    <div className="input-group">
                        <label className="input-label">Premium Payment Frequency</label>
                        <select className="select-field" value={frequency} onChange={e => setFrequency(e.target.value)}>
                            <option value="yearly">Yearly / Annually</option>
                            <option value="half-yearly">Half-Yearly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    <div className="section-divider" />
                    <div className="card-title">Add-on Cover Riders</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="toggle-group" onClick={() => setAccidentalDeath(!accidentalDeath)}>
                            <input type="checkbox" checked={accidentalDeath} onChange={() => {}} className="toggle-checkbox" />
                            <div>
                                <span className="input-label" style={{ fontWeight: 600 }}>Accidental Death Benefit</span>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Additional payout in case of accidental demise</div>
                            </div>
                        </div>

                        <div className="toggle-group" onClick={() => setCriticalIllness(!criticalIllness)}>
                            <input type="checkbox" checked={criticalIllness} onChange={() => {}} className="toggle-checkbox" />
                            <div>
                                <span className="input-label" style={{ fontWeight: 600 }}>Critical Illness Cover</span>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lump sum payout upon diagnosis of 34+ critical conditions</div>
                            </div>
                        </div>

                        <div className="toggle-group" onClick={() => setWaiverOfPremium(!waiverOfPremium)}>
                            <input type="checkbox" checked={waiverOfPremium} onChange={() => {}} className="toggle-checkbox" />
                            <div>
                                <span className="input-label" style={{ fontWeight: 600 }}>Waiver of Premium</span>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Future premiums waived off if diagnosed with permanent disability</div>
                            </div>
                        </div>

                        <div className="toggle-group" onClick={() => setGlobalTravel(!globalTravel)} style={{ borderColor: 'rgba(79, 142, 247, 0.3)' }}>
                            <input type="checkbox" checked={globalTravel} onChange={() => {}} className="toggle-checkbox" />
                            <div>
                                <span className="input-label" style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Global Travel Coverage</span>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Seamless worldwide cover for business trips & leisure travel</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Premium Breakdown (Annual Base vs Riders)</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(result.totalAnnualPremium)} centerSub="Annual Premium" />
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
                    <div className="card-title">Rider Premium Details</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Accidental Death Premium:</span>
                            <strong>{result.accidentalDeathPremium > 0 ? formatINR(result.accidentalDeathPremium) : '₹0'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Critical Illness Premium:</span>
                            <strong>{result.criticalIllnessPremium > 0 ? formatINR(result.criticalIllnessPremium) : '₹0'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Waiver of Premium Cost:</span>
                            <strong>{result.waiverOfPremiumCost > 0 ? formatINR(result.waiverOfPremiumCost) : '₹0'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-primary)' }}>
                            <span>Global Travel Cover Premium:</span>
                            <strong>{result.globalTravelPremium > 0 ? formatINR(result.globalTravelPremium) : '₹0'}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Result Cards ── */}
            <div className="results-grid">
                <div className="result-card highlight">
                    <div className="result-label">Installment Premium</div>
                    <div className="result-value accent">₹{formatNumber(result.totalInstallmentWithGst)}</div>
                    <div className="result-sub">Per {frequency} (incl. 18% GST)</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Tax Savings (Sec 80C)</div>
                    <div className="result-value success">₹{formatNumber(result.taxSaving)}/yr</div>
                    <div className="result-sub">Est. tax saved on premiums</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Yearly Premium</div>
                    <div className="result-value">₹{formatNumber(result.totalWithGstYearly)}</div>
                    <div className="result-sub">Annual cost (incl. GST)</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Term Life Insurance</strong> is a pure protection policy that guarantees financial support of ₹{formatNumber(sumAssured)} to your dependents in your absence. With <strong>Limited Pay</strong> (paying for {adjustedPaymentTerm} years instead of the full {policyTerm}-year cover duration), your premium is compressed but you save on long-term administration charges. 
                {globalTravel && " The selected Global Travel Coverage guarantees that your claim remains valid worldwide, ensuring seamless financial peace of mind during international business or leisure voyages."}
            </div>
        </div>
    );
}
