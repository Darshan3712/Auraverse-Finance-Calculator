import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateWealthCreation, formatINR, formatNumber } from '../../utils/calculations';

export default function WealthCreation() {
    const [monthly, setMonthly] = useState(25000);
    const [years, setYears] = useState(20);
    const [strategy, setStrategy] = useState('moderate');

    const result = useMemo(() => calculateWealthCreation(monthly, years, strategy), [monthly, years, strategy]);

    const strategyInfo = {
        conservative: { label: 'Conservative', desc: '20% Equity · 70% Debt · 10% Gold', color: '#4f8ef7' },
        moderate: { label: 'Moderate', desc: '50% Equity · 35% Debt · 15% Gold', color: '#7c3aed' },
        aggressive: { label: 'Aggressive', desc: '75% Equity · 15% Debt · 10% Gold', color: '#10b981' },
    };

    const alloc = result.allocation;
    const allocSegments = [
        { value: alloc.equity, color: '#10b981', label: 'Equity' },
        { value: alloc.debt, color: '#4f8ef7', label: 'Debt' },
        { value: alloc.gold, color: '#f59e0b', label: 'Gold' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">💎 Wealth Creation Calculator</h1>
            <p className="calc-subtitle">Build long-term wealth through disciplined investing. Choose your risk appetite and see the power of compounding across asset classes.</p>

            <div className="strategy-tabs">
                {Object.entries(strategyInfo).map(([key, info]) => (
                    <button key={key} className={`strategy-tab${strategy === key ? ' active' : ''}`} onClick={() => setStrategy(key)}>
                        {info.label}
                    </button>
                ))}
            </div>

            <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, marginTop: -8 }}>
                {strategyInfo[strategy].desc} · Expected Return: ~{result.expectedReturn}% p.a.
            </div>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Investment Details</div>
                    <SliderInput label="Monthly Investment" value={monthly} onChange={setMonthly} min={1000} max={500000} step={1000} unit="₹/mo" />
                    <SliderInput label="Investment Period" value={years} onChange={setYears} min={5} max={40} step={1} unit="Years" />

                    <div className="section-divider" />
                    <div className="card-title">Asset Allocation</div>
                    <div className="chart-section">
                        <DonutChart segments={allocSegments} size={130} thickness={28}
                            centerLabel={`${result.expectedReturn}%`} centerSub="Est. Return" />
                        <div className="chart-legend">
                            {allocSegments.map((s, i) => (
                                <div className="legend-item" key={i}>
                                    <div className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-label">{s.label}</span>
                                    <span className="legend-value">{s.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-title">Wealth Milestones</div>
                    <div className="results-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div className="result-card highlight">
                            <div className="result-label">Final Corpus</div>
                            <div className="result-value accent" style={{ fontSize: 18 }}>{formatINR(result.futureValue)}</div>
                        </div>
                        <div className="result-card">
                            <div className="result-label">Total Invested</div>
                            <div className="result-value" style={{ fontSize: 18 }}>{formatINR(result.totalInvested)}</div>
                        </div>
                        <div className="result-card success" style={{ gridColumn: 'span 2' }}>
                            <div className="result-label">Wealth Gained</div>
                            <div className="result-value success">{formatINR(result.wealthGained)}</div>
                            <div className="result-sub">{((result.wealthGained / result.totalInvested) * 100).toFixed(0)}% gain over {years} years</div>
                        </div>
                    </div>

                    {result.milestones.length > 0 && (
                        <>
                            <div className="table-title" style={{ marginTop: 16 }}>Year-wise Growth</div>
                            <div className="milestone-grid" style={{ gridTemplateColumns: `repeat(${Math.min(3, result.milestones.length)}, 1fr)` }}>
                                {result.milestones.map(m => (
                                    <div className="milestone-card" key={m.year}>
                                        <div className="milestone-year">Yr {m.year}</div>
                                        <div className="milestone-value">{formatINR(m.value)}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Strategy in Real Life:</strong> Conservative → FDs + Debt MFs + Gold. Moderate → Index Funds + PPF + Gold ETF. Aggressive → Direct Equity + Mid-cap MF + REIT. Rebalance portfolio annually. Step up SIP by 10% each year to accelerate wealth creation significantly.
            </div>
        </div>
    );
}
