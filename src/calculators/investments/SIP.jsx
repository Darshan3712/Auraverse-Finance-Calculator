import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateSIP, calculateStepUpSIP, formatINR, formatNumber } from '../../utils/calculations';

export default function SIP() {
    const [monthly, setMonthly] = useState(10000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    // Step-up SIP state
    const [stepUpEnabled, setStepUpEnabled] = useState(false);
    const [stepUpRate, setStepUpRate] = useState(10);

    // Regular SIP result (always computed)
    const regularResult = useMemo(() => calculateSIP(monthly, rate, years), [monthly, rate, years]);

    // Step-up SIP result (computed when enabled)
    const stepUpResult = useMemo(() =>
        calculateStepUpSIP(monthly, rate, years, stepUpRate),
        [monthly, rate, years, stepUpRate]
    );

    // Active result: step-up if toggle is on, else regular
    const result = stepUpEnabled ? stepUpResult : regularResult;

    // Extra gain from step-up vs regular
    const extraGain = stepUpResult.futureValue - regularResult.futureValue;
    const extraInvested = stepUpResult.invested - regularResult.invested;

    const segments = [
        { value: result.invested, color: '#3b7ef8', label: 'Amount Invested' },
        { value: result.returns, color: '#10b981', label: 'Est. Returns' },
    ];

    // Milestones
    const milestones = [3, 5, 7, 10, 15, 20].filter(y => y <= years).map(y => {
        const v = stepUpEnabled
            ? calculateStepUpSIP(monthly, rate, y, stepUpRate).futureValue
            : calculateSIP(monthly, rate, y).futureValue;
        return { year: y, value: Math.round(v) };
    });

    return (
        <div className="calc-container">
            <h1 className="calc-title">📈 SIP Calculator</h1>
            <p className="calc-subtitle">Systematic Investment Plan — harness the power of compounding with regular monthly investments in mutual funds.</p>

            <div className="calc-grid">
                {/* ── LEFT: Inputs ── */}
                <div className="card">
                    <div className="card-title">Investment Details</div>
                    <SliderInput label="Monthly Investment" value={monthly} onChange={setMonthly} min={500} max={100000} step={500} unit="₹/mo" />
                    <SliderInput label="Expected Annual Return" value={rate} onChange={setRate} min={6} max={25} step={0.5} unit="%" />
                    <SliderInput label="Investment Period" value={years} onChange={setYears} min={1} max={30} step={1} unit="Years" />

                    {/* ── Step-up SIP Toggle ── */}
                    <div className="section-divider" />
                    <div className="stepup-toggle-row" onClick={() => setStepUpEnabled(e => !e)}>
                        <div className="stepup-toggle-left">
                            <div className={`stepup-switch${stepUpEnabled ? ' on' : ''}`}>
                                <div className="stepup-knob" />
                            </div>
                            <div>
                                <div className="stepup-label">Step-up SIP</div>
                                <div className="stepup-desc">Increase SIP every year</div>
                            </div>
                        </div>
                        <div className={`stepup-badge${stepUpEnabled ? ' active' : ''}`}>
                            {stepUpEnabled ? 'ON' : 'OFF'}
                        </div>
                    </div>

                    {/* ── Step-up rate slider — only when enabled ── */}
                    {stepUpEnabled && (
                        <div className="stepup-config">
                            <SliderInput
                                label="Annual Increment"
                                value={stepUpRate}
                                onChange={setStepUpRate}
                                min={1}
                                max={50}
                                step={1}
                                unit="%/yr"
                            />
                            <div className="stepup-preview">
                                <span>Yr 1: <strong>₹{formatNumber(monthly)}</strong></span>
                                <span>Yr 2: <strong>₹{formatNumber(Math.round(monthly * (1 + stepUpRate / 100)))}</strong></span>
                                <span>Yr 3: <strong>₹{formatNumber(Math.round(monthly * Math.pow(1 + stepUpRate / 100, 2)))}</strong></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Breakup {stepUpEnabled ? '(Step-up SIP)' : '(Regular SIP)'}</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(result.futureValue)} centerSub="Total Value" />
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

                    {/* Step-up vs Regular comparison pill */}
                    {stepUpEnabled && (
                        <div className="stepup-vs-box">
                            <div className="stepup-vs-row">
                                <span className="stepup-vs-label">🟦 Regular SIP</span>
                                <span className="stepup-vs-val">{formatINR(regularResult.futureValue)}</span>
                            </div>
                            <div className="stepup-vs-row highlight">
                                <span className="stepup-vs-label">🚀 Step-up SIP</span>
                                <span className="stepup-vs-val accent">{formatINR(stepUpResult.futureValue)}</span>
                            </div>
                            <div className="stepup-extra">
                                <span>Extra Corpus</span>
                                <span className="stepup-extra-val">+{formatINR(extraGain)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Result Cards ── */}
            <div className="results-grid">
                <div className="result-card highlight">
                    <div className="result-label">Future Value</div>
                    <div className="result-value accent">₹{formatNumber(result.futureValue)}</div>
                    {stepUpEnabled && <div className="result-sub">+{formatINR(extraGain)} vs regular</div>}
                </div>
                <div className="result-card">
                    <div className="result-label">Total Invested</div>
                    <div className="result-value">₹{formatNumber(result.invested)}</div>
                    {stepUpEnabled && <div className="result-sub">+{formatINR(extraInvested)} more invested</div>}
                </div>
                <div className="result-card success">
                    <div className="result-label">Estimated Returns</div>
                    <div className="result-value success">₹{formatNumber(result.returns)}</div>
                    <div className="result-sub">{((result.returns / result.invested) * 100).toFixed(1)}% of invested</div>
                </div>
            </div>

            {/* ── Milestones ── */}
            {milestones.length > 0 && (
                <>
                    <div className="section-divider" />
                    <div className="card">
                        <div className="table-title">Growth Milestones {stepUpEnabled ? '(with step-up)' : ''}</div>
                        <div className="milestone-grid">
                            {milestones.map(m => (
                                <div className="milestone-card" key={m.year}>
                                    <div className="milestone-year">After {m.year} yr{m.year > 1 ? 's' : ''}</div>
                                    <div className="milestone-value">{formatINR(m.value)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ── Year-wise Breakdown Table (only for step-up) ── */}
            {stepUpEnabled && stepUpResult.yearlyBreakdown?.length > 0 && (
                <div className="card" style={{ marginTop: 20 }}>
                    <div className="table-title">Year-wise Step-up Breakdown</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="amort-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Monthly SIP</th>
                                    <th>Total Invested</th>
                                    <th>Portfolio Value</th>
                                    <th>Gain</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stepUpResult.yearlyBreakdown.map(row => (
                                    <tr key={row.year}>
                                        <td>Year {row.year}</td>
                                        <td>₹{formatNumber(row.monthlyAmount)}</td>
                                        <td>₹{formatNumber(row.invested)}</td>
                                        <td>₹{formatNumber(row.value)}</td>
                                        <td style={{ color: 'var(--accent-success)', fontWeight: 700 }}>
                                            +₹{formatNumber(row.value - row.invested)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="info-box">
                {stepUpEnabled
                    ? `💡 Step-up SIP: Starting at ₹${formatNumber(monthly)}/mo and increasing by ${stepUpRate}% each year, your final monthly SIP in year ${years} becomes ₹${formatNumber(Math.round(monthly * Math.pow(1 + stepUpRate / 100, years - 1)))}. This strategy leverages salary hikes and significantly boosts your corpus by ${formatINR(extraGain)} compared to a regular SIP!`
                    : `💡 Formula: M = P × [{(1+i)^n – 1} / i] × (1+i) — where P = Monthly SIP, i = monthly rate, n = months. Enable Step-up SIP above to model annual increment in investments!`
                }
            </div>
        </div>
    );
}
