import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateRiskManagement, formatINR, formatNumber } from '../../utils/calculations';

export default function RiskManagement() {
    const [age, setAge] = useState(30);
    const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
    const [currentSavings, setCurrentSavings] = useState(200000);
    const [riskLevel, setRiskLevel] = useState('moderate');
    const [annualIncome, setAnnualIncome] = useState(1200000);
    const [currentTermCover, setCurrentTermCover] = useState(5000000); // 50 Lakhs
    const [currentHealthCover, setCurrentHealthCover] = useState(300000); // 3 Lakhs
    const [outstandingDebts, setOutstandingDebts] = useState(1500000); // 15 Lakhs

    const result = useMemo(() => {
        return calculateRiskManagement(
            age,
            monthlyExpenses,
            currentSavings,
            riskLevel,
            annualIncome,
            currentTermCover,
            currentHealthCover,
            outstandingDebts
        );
    }, [age, monthlyExpenses, currentSavings, riskLevel, annualIncome, currentTermCover, currentHealthCover, outstandingDebts]);

    const segments = [
        { value: result.allocation.equity, color: '#3b7ef8', label: 'Equity (Stocks/Mutual Funds)' },
        { value: result.allocation.debt, color: '#7c3aed', label: 'Debt (FDs/Bonds)' },
        { value: result.allocation.gold, color: '#f59e0b', label: 'Gold (Hedge)' },
        { value: result.allocation.cash, color: '#10b981', label: 'Cash (Liquid)' }
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">🛡️ Risk Management & Asset Allocation</h1>
            <p className="calc-subtitle">Evaluate your portfolio allocation, emergency cushion, and insurance coverage levels to shield your wealth from market downswings.</p>

            {/* Risk Selector Tabs */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-title">Choose Risk Profile</div>
                <div className="strategy-tabs">
                    <button className={`strategy-tab ${riskLevel === 'conservative' ? 'active' : ''}`} onClick={() => setRiskLevel('conservative')}>🛡️ Conservative</button>
                    <button className={`strategy-tab ${riskLevel === 'moderate' ? 'active' : ''}`} onClick={() => setRiskLevel('moderate')}>⚖️ Balanced / Moderate</button>
                    <button className={`strategy-tab ${riskLevel === 'aggressive' ? 'active' : ''}`} onClick={() => setRiskLevel('aggressive')}>🚀 Growth / Aggressive</button>
                </div>
            </div>

            <div className="calc-grid">
                {/* ── LEFT: Inputs ── */}
                <div className="card">
                    <div className="card-title">Financial Demographics & Coverage</div>
                    <SliderInput label="Your Current Age" value={age} onChange={setAge} min={18} max={75} step={1} unit="Years" />
                    <SliderInput label="Annual Income" value={annualIncome} onChange={setAnnualIncome} min={100000} max={10000000} step={50000} unit="₹" />
                    <SliderInput label="Monthly Living Expenses" value={monthlyExpenses} onChange={setMonthlyExpenses} min={5000} max={500000} step={2000} unit="₹" />
                    <SliderInput label="Outstanding Debts & Liabilities" value={outstandingDebts} onChange={setOutstandingDebts} min={0} max={20000000} step={50000} unit="₹" />
                    <SliderInput label="Current Liquid Savings" value={currentSavings} onChange={setCurrentSavings} min={0} max={10000000} step={10000} unit="₹" />
                    <SliderInput label="Existing Term Life Cover" value={currentTermCover} onChange={setCurrentTermCover} min={0} max={50000000} step={500000} unit="₹" />
                    <SliderInput label="Existing Health Cover" value={currentHealthCover} onChange={setCurrentHealthCover} min={0} max={5000000} step={50000} unit="₹" />
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Recommended Asset Allocation</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={`${100 - age}% Equity`} centerSub="Rule of Thumb Base" />
                        <div className="chart-legend">
                            {segments.map((s, i) => (
                                <div className="legend-item" key={i}>
                                    <div className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-label">{s.label}</span>
                                    <span className="legend-value">{s.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-divider" />
                    <div className="card-title">Portfolio Allocation Weights</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ flex: 1, padding: '10px', background: 'rgba(59, 126, 248, 0.08)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>EQUITY</div>
                            <strong style={{ fontSize: '15px' }}>{result.allocation.equity}%</strong>
                        </div>
                        <div style={{ flex: 1, padding: '10px', background: 'rgba(124, 58, 237, 0.08)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>DEBT</div>
                            <strong style={{ fontSize: '15px' }}>{result.allocation.debt}%</strong>
                        </div>
                        <div style={{ flex: 1, padding: '10px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>GOLD</div>
                            <strong style={{ fontSize: '15px' }}>{result.allocation.gold}%</strong>
                        </div>
                        <div style={{ flex: 1, padding: '10px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CASH</div>
                            <strong style={{ fontSize: '15px' }}>{result.allocation.cash}%</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Protection Advisory Checks ── */}
            <div className="card-title" style={{ marginTop: '20px' }}>Risk Mitigation & Insurance Audits</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '10px' }}>
                {/* Emergency Cushion Card */}
                <div className={`result-card ${result.emergencyFundStatus === 'Adequate' ? 'success' : 'highlight'}`} style={{ textAlign: 'left', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="result-label" style={{ margin: 0 }}>Emergency Reserve</span>
                        <span style={{ 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            background: result.emergencyFundStatus === 'Adequate' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: result.emergencyFundStatus === 'Adequate' ? 'var(--accent-success)' : 'var(--accent-danger)'
                        }}>{result.emergencyFundStatus}</span>
                    </div>
                    <div className="result-value" style={{ margin: '8px 0 2px 0' }}>₹{formatNumber(result.recommendedEmergency)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required target buffer ({riskLevel === 'conservative' ? '9' : '6'} months of expenses)</div>
                    {result.emergencyGap > 0 && (
                        <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--accent-danger)', fontWeight: 600 }}>
                            ⚠️ Gap detected: Add ₹{formatNumber(result.emergencyGap)} to savings
                        </div>
                    )}
                </div>

                {/* Term Life Insurance Card */}
                <div className={`result-card ${result.termAdequacy === 'Adequate' ? 'success' : 'highlight'}`} style={{ textAlign: 'left', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="result-label" style={{ margin: 0 }}>Term Life Cover</span>
                        <span style={{ 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            background: result.termAdequacy === 'Adequate' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: result.termAdequacy === 'Adequate' ? 'var(--accent-success)' : 'var(--accent-danger)'
                        }}>{result.termAdequacy}</span>
                    </div>
                    <div className="result-value" style={{ margin: '8px 0 2px 0' }}>₹{formatNumber(result.recommendedTerm)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required target cover (10x income + outstanding debts)</div>
                    {result.termGap > 0 && (
                        <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--accent-danger)', fontWeight: 600 }}>
                            ⚠️ Cover shortfall: Secure ₹{formatNumber(result.termGap)} additional cover
                        </div>
                    )}
                </div>

                {/* Health Insurance Card */}
                <div className={`result-card ${result.healthAdequacy === 'Adequate' ? 'success' : 'highlight'}`} style={{ textAlign: 'left', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="result-label" style={{ margin: 0 }}>Health Insurance</span>
                        <span style={{ 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            background: result.healthAdequacy === 'Adequate' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: result.healthAdequacy === 'Adequate' ? 'var(--accent-success)' : 'var(--accent-danger)'
                        }}>{result.healthAdequacy}</span>
                    </div>
                    <div className="result-value" style={{ margin: '8px 0 2px 0' }}>₹{formatNumber(result.recommendedHealth)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Required target medical cover (50% of annual income, min 5L)</div>
                    {result.healthGap > 0 && (
                        <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--accent-danger)', fontWeight: 600 }}>
                            ⚠️ Cover shortfall: Add ₹{formatNumber(result.healthGap)} to health policy
                        </div>
                    )}
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Risk Management Principles:</strong> Sound financial planning requires securing safety buffers BEFORE investing in growth assets. This planner recommends: (1) An **Emergency Fund** of ₹{formatNumber(result.recommendedEmergency)} to handle sudden job loss or medical crises. (2) A **Term Insurance Cover** of ₹{formatNumber(result.recommendedTerm)} to protect family members from outstanding debts. (3) A **Health Cover** of ₹{formatNumber(result.recommendedHealth)} to avoid draining family investments for healthcare treatments. Once safety buffers are adequate, allocate your investable income across Equity, Debt, and Gold according to your age profile and risk tolerance!
            </div>
        </div>
    );
}
