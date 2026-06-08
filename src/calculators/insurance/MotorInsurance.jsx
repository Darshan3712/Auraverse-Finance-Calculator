import { useState, useMemo, useEffect } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateMotorInsurance, formatINR, formatNumber } from '../../utils/calculations';

const NCB_STAGES = [
    { label: '0%', value: 0 },
    { label: '20% (1 yr)', value: 20 },
    { label: '25% (2 yrs)', value: 25 },
    { label: '35% (3 yrs)', value: 35 },
    { label: '45% (4 yrs)', value: 45 },
    { label: '50% (5+ yrs)', value: 50 }
];

export default function MotorInsurance() {
    const [vehicleType, setVehicleType] = useState('car');
    const [policyType, setPolicyType] = useState('comprehensive');
    
    // Sliders state
    const [exShowroom, setExShowroom] = useState(800000);
    const [age, setAge] = useState(1); // years
    const [cc, setCc] = useState(1200);
    const [ncb, setNcb] = useState(0);

    // Add-ons State (Comprehensive/OD only)
    const [zeroDep, setZeroDep] = useState(false);
    const [engineProtect, setEngineProtect] = useState(false);
    const [rsa, setRsa] = useState(false);

    // Dynamic defaults when changing vehicle type
    useEffect(() => {
        if (vehicleType === 'car') {
            setExShowroom(800000);
            setCc(1200);
        } else {
            setExShowroom(120000);
            setCc(150);
        }
    }, [vehicleType]);

    // Calculate outputs
    const result = useMemo(() => {
        return calculateMotorInsurance(
            vehicleType,
            exShowroom,
            age,
            cc,
            ncb,
            policyType,
            { zeroDep, engineProtect, rsa }
        );
    }, [vehicleType, exShowroom, age, cc, ncb, policyType, zeroDep, engineProtect, rsa]);

    // Graph segments
    const segments = useMemo(() => {
        if (policyType === 'tp_only') {
            return [
                { value: result.tpPremium, color: '#f59e0b', label: 'Third Party' }
            ];
        }
        if (policyType === 'od_only') {
            return [
                { value: result.netODPremium > 0 ? result.netODPremium : 0.001, color: '#3b7ef8', label: 'Own Damage (Net)' },
                { value: result.addonsCost > 0 ? result.addonsCost : 0.001, color: '#7c3aed', label: 'Add-on Covers' }
            ];
        }
        return [
            { value: result.netODPremium > 0 ? result.netODPremium : 0.001, color: '#3b7ef8', label: 'Own Damage (Net)' },
            { value: result.tpPremium, color: '#f59e0b', label: 'Third Party' },
            { value: result.addonsCost > 0 ? result.addonsCost : 0.001, color: '#7c3aed', label: 'Add-on Covers' }
        ];
    }, [policyType, result]);

    return (
        <div className="calc-container">
            <h1 className="calc-title">🚗 Motor Insurance Calculator</h1>
            <p className="calc-subtitle">Calculate premiums, own damage coverage, and Insured Declared Value (IDV) for your cars and two-wheelers.</p>

            {/* Vehicle Type Choice */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label className="input-label">Vehicle Category</label>
                        <div className="strategy-tabs" style={{ marginTop: '4px' }}>
                            <button className={`strategy-tab ${vehicleType === 'car' ? 'active' : ''}`} onClick={() => setVehicleType('car')}>🚗 Four-Wheeler (Car)</button>
                            <button className={`strategy-tab ${vehicleType === 'bike' ? 'active' : ''}`} onClick={() => setVehicleType('bike')}>🏍️ Two-Wheeler (Bike)</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="calc-grid">
                {/* ── LEFT: Inputs ── */}
                <div className="card">
                    <div className="card-title">Vehicle & Policy Specifications</div>
                    
                    <div className="input-group">
                        <label className="input-label">Policy Type</label>
                        <select className="select-field" value={policyType} onChange={e => setPolicyType(e.target.value)}>
                            <option value="comprehensive">Comprehensive Plan (OD + TP + Add-ons)</option>
                            <option value="od_only">Own Damage Only (OD + Add-ons)</option>
                            <option value="tp_only">Third Party Only (TP)</option>
                        </select>
                    </div>

                    <SliderInput 
                        label="Ex-Showroom Price" 
                        value={exShowroom} 
                        onChange={setExShowroom} 
                        min={vehicleType === 'car' ? 300000 : 40000} 
                        max={vehicleType === 'car' ? 10000000 : 1000000} 
                        step={vehicleType === 'car' ? 25000 : 5000} 
                        unit="₹" 
                    />
                    
                    <SliderInput label="Vehicle Age" value={age} onChange={setAge} min={0} max={10} step={1} unit="Years" />
                    
                    <SliderInput 
                        label="Engine Capacity" 
                        value={cc} 
                        onChange={setCc} 
                        min={vehicleType === 'car' ? 600 : 50} 
                        max={vehicleType === 'car' ? 4000 : 1200} 
                        step={10} 
                        unit="CC" 
                    />

                    {policyType !== 'tp_only' && (
                        <div className="input-group">
                            <label className="input-label">No Claim Bonus (NCB)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                {NCB_STAGES.map(stage => (
                                    <button 
                                        key={stage.value} 
                                        className={`strategy-tab ${ncb === stage.value ? 'active' : ''}`}
                                        onClick={() => setNcb(stage.value)}
                                        style={{ flex: '1 1 auto', fontSize: '11px', padding: '6px 8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                                    >
                                        {stage.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add-ons Checklist */}
                    {policyType !== 'tp_only' && (
                        <>
                            <div className="section-divider" />
                            <div className="card-title">Add-on Cover Options</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div className="toggle-group" onClick={() => setZeroDep(!zeroDep)}>
                                    <input type="checkbox" checked={zeroDep} onChange={() => {}} className="toggle-checkbox" />
                                    <div>
                                        <span className="input-label" style={{ fontWeight: 600 }}>Zero Depreciation Cover</span>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Get full claim without deductions for parts depreciation</div>
                                    </div>
                                </div>

                                <div className="toggle-group" onClick={() => setEngineProtect(!engineProtect)}>
                                    <input type="checkbox" checked={engineProtect} onChange={() => {}} className="toggle-checkbox" />
                                    <div>
                                        <span className="input-label" style={{ fontWeight: 600 }}>Engine Protection Cover</span>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Covers damage to engine caused by waterlogging or oil leakage</div>
                                    </div>
                                </div>

                                <div className="toggle-group" onClick={() => setRsa(!rsa)}>
                                    <input type="checkbox" checked={rsa} onChange={() => {}} className="toggle-checkbox" />
                                    <div>
                                        <span className="input-label" style={{ fontWeight: 600 }}>Roadside Assistance (RSA)</span>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Emergency flat tire, towing, and fuel support</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Premium Breakdown Structure</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(result.finalPremium)} centerSub="Payable Premium" />
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
                    <div className="card-title">Policy Calculations</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Insured Declared Value (IDV):</span>
                            <strong style={{ color: 'var(--accent-primary)', fontSize: '13px' }}>{formatINR(result.idv)} ({100 - result.depPercent}% of original)</strong>
                        </div>
                        {policyType !== 'tp_only' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Base Own Damage (OD):</span>
                                    <span>{formatINR(result.odBase)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-success)' }}>
                                    <span>NCB Discount ({ncb}%):</span>
                                    <span>-{formatINR(result.ncbDiscount)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                    <span>Net Own Damage Premium:</span>
                                    <span>{formatINR(result.netODPremium)}</span>
                                </div>
                            </>
                        )}
                        {policyType !== 'od_only' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Third Party Premium (TP):</span>
                                <span>{formatINR(result.tpPremium)}</span>
                            </div>
                        )}
                        {policyType !== 'tp_only' && result.addonsCost > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Add-ons Combined Cost:</span>
                                <span>{formatINR(result.addonsCost)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>GST (18%):</span>
                            <span>{formatINR(result.gst)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Result Cards ── */}
            <div className="results-grid">
                <div className="result-card highlight">
                    <div className="result-label">Payable Premium</div>
                    <div className="result-value accent">₹{formatNumber(result.finalPremium)}</div>
                    <div className="result-sub">Annual cost (incl. GST)</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Insured Value (IDV)</div>
                    <div className="result-value success">₹{formatNumber(result.idv)}</div>
                    <div className="result-sub">Max claim payout on theft/total loss</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Net Net Premium</div>
                    <div className="result-value">₹{formatNumber(result.netPremium)}</div>
                    <div className="result-sub">Excluding GST</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Insured Declared Value (IDV)</strong> is the maximum sum assured fixed by the insurer, which depreciates over time based on vehicle age (from 5% depreciation for new vehicles up to 50%+ for 5+ years). <strong>No Claim Bonus (NCB)</strong> is a reward discount ranging from 20% to 50% given on the Own Damage premium for not making claims during previous policy years.
            </div>
        </div>
    );
}
