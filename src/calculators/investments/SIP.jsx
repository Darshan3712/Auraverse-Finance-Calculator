import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { formatINR, formatNumber } from '../../utils/calculations';

/* ─────────────────────────────────────────────────────────────────────────
   MATH HELPERS
───────────────────────────────────────────────────────────────────────── */

/**
 * Generic SIP / periodic investment future value calculator.
 * Ordinary annuity (end-of-period payments).
 */
function calcPeriodicFV(amount, annualRate, years, frequency) {
    const r = annualRate / 100;

    if (frequency === 'lumpsum') {
        const fv = amount * Math.pow(1 + r, years);
        return { fv: Math.round(fv), invested: amount, returns: Math.round(fv - amount), periods: 1 };
    }

    let periodicRate, periods;
    if (frequency === 'monthly') {
        periodicRate = r / 12;
        periods = years * 12;
    } else if (frequency === 'half-yearly') {
        periodicRate = Math.pow(1 + r, 0.5) - 1;
        periods = years * 2;
    } else {
        // yearly
        periodicRate = r;
        periods = years;
    }

    const fv = periodicRate > 0
        ? amount * ((Math.pow(1 + periodicRate, periods) - 1) / periodicRate) * (1 + periodicRate)
        : amount * periods;

    const invested = amount * periods;
    return {
        fv: Math.round(fv),
        invested: Math.round(invested),
        returns: Math.round(fv - invested),
        periods,
    };
}

/**
 * Year-wise breakdown for a periodic investment.
 */
function calcYearlyBreakdown(amount, annualRate, investYears, frequency) {
    const r = annualRate / 100;
    const rows = [];

    for (let y = 1; y <= investYears; y++) {
        const res = calcPeriodicFV(amount, annualRate, y, frequency);
        rows.push({
            year: y,
            invested: res.invested,
            value: res.fv,
        });
    }
    return rows;
}

/**
 * "Invest for X years, stay invested for Y total years" calculator.
 * Phase 1: Accumulate corpus over investYears using periodic contributions.
 * Phase 2: That corpus grows at the same rate for (totalYears - investYears) more years, no new contributions.
 */
function calcEarlyStop(amount, annualRate, investYears, totalYears, frequency) {
    const r = annualRate / 100;

    // Corpus at end of investment phase
    const phase1 = calcPeriodicFV(amount, annualRate, investYears, frequency);
    const corpusAtStop = phase1.fv;

    // Corpus grows for remaining years with no contributions
    const remainingYears = totalYears - investYears;
    const finalValue = Math.round(corpusAtStop * Math.pow(1 + r, remainingYears));

    const totalInvested = phase1.invested;
    const totalReturns  = finalValue - totalInvested;

    // Year-by-year: show corpus growth across ALL totalYears
    const rows = [];
    for (let y = 1; y <= totalYears; y++) {
        let val, invested;
        if (y <= investYears) {
            const res = calcPeriodicFV(amount, annualRate, y, frequency);
            val = res.fv;
            invested = res.invested;
        } else {
            // No new investment — corpus from investYears grows
            const growYears = y - investYears;
            val = Math.round(corpusAtStop * Math.pow(1 + r, growYears));
            invested = totalInvested; // same, no new contributions
        }
        rows.push({ year: y, invested, value: val, investing: y <= investYears });
    }

    return {
        corpusAtStop,
        finalValue,
        totalInvested,
        totalReturns,
        rows,
    };
}

/* ─────────────────────────────────────────────────────────────────────────
   FREQUENCY TABS
───────────────────────────────────────────────────────────────────────── */
const FREQUENCIES = [
    { id: 'monthly',     label: 'Monthly',   icon: '📅' },
    { id: 'half-yearly', label: '6 Months',  icon: '🗓️' },
    { id: 'yearly',      label: 'Yearly',    icon: '📆' },
    { id: 'lumpsum',     label: 'One-Time',  icon: '💰' },
];

const FREQ_UNIT = {
    monthly:      '₹/mo',
    'half-yearly': '₹/6mo',
    yearly:       '₹/yr',
    lumpsum:      '₹',
};

const FREQ_LABEL = {
    monthly:      'Monthly Investment',
    'half-yearly': 'Investment Every 6 Months',
    yearly:       'Yearly Investment',
    lumpsum:      'One-Time Investment',
};

const FREQ_DEFAULTS = {
    monthly:      10000,
    'half-yearly': 60000,
    yearly:       120000,
    lumpsum:      500000,
};

const FREQ_MIN = { monthly: 500, 'half-yearly': 3000, yearly: 6000, lumpsum: 10000 };
const FREQ_MAX = { monthly: 200000, 'half-yearly': 1200000, yearly: 2400000, lumpsum: 50000000 };
const FREQ_STEP = { monthly: 500, 'half-yearly': 5000, yearly: 5000, lumpsum: 10000 };

function FreqTabs({ value, onChange }) {
    return (
        <div className="freq-tabs-row">
            {FREQUENCIES.map(f => (
                <button
                    key={f.id}
                    className={`freq-tab${value === f.id ? ' active' : ''}`}
                    onClick={() => onChange(f.id)}
                >
                    <span className="freq-tab-icon">{f.icon}</span>
                    {f.label}
                </button>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function SIP() {
    // ── Regular SIP state
    const [amount,      setAmount]      = useState(10000);
    const [rate,        setRate]        = useState(12);
    const [years,       setYears]       = useState(10);
    const [frequency,   setFrequency]   = useState('monthly');
    const [stepUp,      setStepUp]      = useState(false);
    const [stepUpRate,  setStepUpRate]  = useState(10);
    const [showTable,   setShowTable]   = useState(false);

    // ── Tab state
    const [activeTab, setActiveTab] = useState(1);

    // ── Early-Stop section state
    const [esAmount,    setEsAmount]    = useState(10000);
    const [esRate,      setEsRate]      = useState(12);
    const [esInvYears,  setEsInvYears]  = useState(5);
    const [esTotalYrs,  setEsTotalYrs]  = useState(25);
    const [esFreq,      setEsFreq]      = useState('monthly');
    const [esShowAll,   setEsShowAll]   = useState(false);

    // ── Handle frequency change → reset amount to sensible default
    const handleFreqChange = (f) => {
        setFrequency(f);
        setAmount(FREQ_DEFAULTS[f]);
    };

    const handleEsFreqChange = (f) => {
        setEsFreq(f);
        setEsAmount(FREQ_DEFAULTS[f]);
    };

    /* ── Regular SIP result ── */
    const result = useMemo(() => {
        if (stepUp && frequency === 'monthly') {
            // Step-up only meaningful for monthly
            const r = rate / 12 / 100;
            const g = stepUpRate / 100;
            const annualFV = ((Math.pow(1 + r, 12) - 1) / r) * (1 + r);
            let fv = 0, invested = 0;
            for (let y = 1; y <= years; y++) {
                const P = amount * Math.pow(1 + g, y - 1);
                const rem = years - y;
                fv += P * annualFV * Math.pow(1 + r, rem * 12);
                invested += P * 12;
            }
            return { fv: Math.round(fv), invested: Math.round(invested), returns: Math.round(fv - invested) };
        }
        const res = calcPeriodicFV(amount, rate, years, frequency);
        return { fv: res.fv, invested: res.invested, returns: res.returns };
    }, [amount, rate, years, frequency, stepUp, stepUpRate]);

    /* ── Year-wise breakdown for regular SIP ── */
    const yearlyBreakdown = useMemo(
        () => calcYearlyBreakdown(amount, rate, years, frequency),
        [amount, rate, years, frequency]
    );

    /* ── Early-Stop result ── */
    const esResult = useMemo(
        () => calcEarlyStop(esAmount, esRate, esInvYears, esTotalYrs, esFreq),
        [esAmount, esRate, esInvYears, esTotalYrs, esFreq]
    );

    const segments = [
        { value: result.invested, color: '#3b7ef8', label: 'Amount Invested' },
        { value: result.returns,  color: '#10b981', label: 'Est. Returns' },
    ];

    const esSegments = [
        { value: esResult.totalInvested, color: '#3b7ef8', label: 'Amount Invested' },
        { value: Math.max(0, esResult.totalReturns), color: '#10b981', label: 'Returns Earned' },
    ];

    const displayRows    = showTable ? yearlyBreakdown : yearlyBreakdown.slice(0, 5);
    const esDisplayRows  = esShowAll ? esResult.rows  : esResult.rows.slice(0, 8);

    // Milestones for regular SIP
    const milestones = [3, 5, 7, 10, 15, 20, 25, 30]
        .filter(y => y <= years)
        .map(y => ({ year: y, value: calcPeriodicFV(amount, rate, y, frequency).fv }));

    return (
        <div className="calc-container">
            <h1 className="calc-title">📈 SIP Calculator</h1>
            <p className="calc-subtitle">
                Systematic Investment Plan — harness the power of compounding with regular investments in mutual funds.
            </p>

            {/* ══ TOP TABS ══ */}
            <div className="sip-top-tabs">
                <button
                    className={`sip-top-tab${activeTab === 1 ? ' active' : ''}`}
                    onClick={() => setActiveTab(1)}
                >
                    <span>📊</span>
                    <div>
                        <div className="sip-top-tab-title">SIP Calculator</div>
                        <div className="sip-top-tab-sub">Regular / Step-up investments</div>
                    </div>
                </button>
                <button
                    className={`sip-top-tab${activeTab === 2 ? ' active' : ''}`}
                    onClick={() => setActiveTab(2)}
                >
                    <span>⏸️→📈</span>
                    <div>
                        <div className="sip-top-tab-title">Invest Early, Grow Long</div>
                        <div className="sip-top-tab-sub">Stop investing, keep compounding</div>
                    </div>
                </button>
            </div>

            {activeTab === 1 && (<>
            {/* ══ SECTION: INVESTMENT FREQUENCY ══════════════════════════════ */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title">Investment Frequency</div>
                <FreqTabs value={frequency} onChange={handleFreqChange} />
            </div>

            <div className="calc-grid">
                {/* ── LEFT: Inputs ── */}
                <div className="card">
                    <div className="card-title">Investment Details</div>
                    <SliderInput
                        label={FREQ_LABEL[frequency]}
                        value={amount}
                        onChange={setAmount}
                        min={FREQ_MIN[frequency]}
                        max={FREQ_MAX[frequency]}
                        step={FREQ_STEP[frequency]}
                        unit={FREQ_UNIT[frequency]}
                    />
                    <SliderInput label="Expected Annual Return" value={rate} onChange={setRate} min={1} max={30} step={0.5} unit="%" />
                    <SliderInput label="Investment Period" value={years} onChange={setYears} min={1} max={40} step={1} unit="Years" />

                    {/* Step-up toggle — only for monthly */}
                    {frequency === 'monthly' && (
                        <>
                            <div className="section-divider" />
                            <div className="stepup-toggle-row" onClick={() => setStepUp(e => !e)}>
                                <div className="stepup-toggle-left">
                                    <div className={`stepup-switch${stepUp ? ' on' : ''}`}>
                                        <div className="stepup-knob" />
                                    </div>
                                    <div>
                                        <div className="stepup-label">Step-up SIP</div>
                                        <div className="stepup-desc">Increase SIP every year</div>
                                    </div>
                                </div>
                                <div className={`stepup-badge${stepUp ? ' active' : ''}`}>
                                    {stepUp ? 'ON' : 'OFF'}
                                </div>
                            </div>
                            {stepUp && (
                                <div className="stepup-config">
                                    <SliderInput
                                        label="Annual Increment"
                                        value={stepUpRate}
                                        onChange={setStepUpRate}
                                        min={1} max={50} step={1} unit="%/yr"
                                    />
                                    <div className="stepup-preview">
                                        <span>Yr 1: <strong>₹{formatNumber(amount)}</strong></span>
                                        <span>Yr 2: <strong>₹{formatNumber(Math.round(amount * (1 + stepUpRate / 100)))}</strong></span>
                                        <span>Yr 3: <strong>₹{formatNumber(Math.round(amount * Math.pow(1 + stepUpRate / 100, 2)))}</strong></span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Investment Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32} centerLabel={formatINR(result.fv)} centerSub="Total Value" />
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

            {/* ── Result Cards ── */}
            <div className="results-grid">
                <div className="result-card highlight">
                    <div className="result-label">Future Value</div>
                    <div className="result-value accent">{formatINR(result.fv)}</div>
                    <div className="result-sub">After {years} years</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Invested</div>
                    <div className="result-value">{formatINR(result.invested)}</div>
                    <div className="result-sub">Your contribution</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Est. Returns</div>
                    <div className="result-value success">{formatINR(result.returns)}</div>
                    <div className="result-sub">{((result.returns / result.invested) * 100).toFixed(1)}% gain on invested</div>
                </div>
            </div>

            {/* ── Milestones ── */}
            {milestones.length > 0 && (
                <>
                    <div className="section-divider" />
                    <div className="card">
                        <div className="table-title">Growth Milestones</div>
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

            {/* ── Year-wise Table ── */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Year-wise Growth Breakdown</div>
                <div style={{ overflowX: 'auto', maxHeight: showTable ? '360px' : undefined }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Total Invested</th>
                                <th>Portfolio Value</th>
                                <th>Gain</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayRows.map(row => (
                                <tr key={row.year}>
                                    <td>Year {row.year}</td>
                                    <td>₹{formatNumber(row.invested)}</td>
                                    <td style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                        ₹{formatNumber(row.value)}
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                            +₹{formatNumber(Math.max(0, row.value - row.invested))}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {yearlyBreakdown.length > 5 && (
                    <button className="show-more-btn" onClick={() => setShowTable(v => !v)}>
                        {showTable ? '▲ Show Less' : `▼ Show All ${yearlyBreakdown.length} Years`}
                    </button>
                )}
            </div>

            <div className="info-box" style={{ marginBottom: 32 }}>
                💡 Investing ₹{formatNumber(amount)}{FREQ_UNIT[frequency] !== '₹' ? ' ' + FREQ_UNIT[frequency] : ''} at <strong>{rate}%</strong> p.a. for <strong>{years} years</strong> grows to <strong>{formatINR(result.fv)}</strong>.
                You invest <strong>{formatINR(result.invested)}</strong> and earn <strong>{formatINR(result.returns)}</strong> as returns.
            </div>
            </>)}

            {activeTab === 2 && (
            <div className="early-stop-section" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className="early-stop-header">
                    <span className="early-stop-icon">⏸️→📈</span>
                    <div>
                        <div className="early-stop-title">Invest Early, Stop Early — Let It Grow</div>
                        <div className="early-stop-sub">
                            Invest for a few years, then stop — but keep the money invested for the full period.
                            Your corpus keeps compounding even after you stop contributing.
                        </div>
                    </div>
                </div>

                {/* Frequency for early-stop */}
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-title">Investment Frequency</div>
                    <FreqTabs value={esFreq} onChange={handleEsFreqChange} />
                </div>

                <div className="calc-grid">
                    {/* Inputs */}
                    <div className="card">
                        <div className="card-title">Your Investment Plan</div>
                        <SliderInput
                            label={FREQ_LABEL[esFreq]}
                            value={esAmount}
                            onChange={setEsAmount}
                            min={FREQ_MIN[esFreq]}
                            max={FREQ_MAX[esFreq]}
                            step={FREQ_STEP[esFreq]}
                            unit={FREQ_UNIT[esFreq]}
                        />
                        <SliderInput
                            label="Expected Annual Return"
                            value={esRate}
                            onChange={setEsRate}
                            min={1} max={30} step={0.5} unit="%"
                        />
                        <SliderInput
                            label="You Will Invest For (Years)"
                            value={esInvYears}
                            onChange={v => setEsInvYears(Math.min(v, esTotalYrs - 1))}
                            min={1} max={esTotalYrs - 1} step={1} unit="Years"
                        />
                        <SliderInput
                            label="Total Stay-Invested Period"
                            value={esTotalYrs}
                            onChange={v => setEsTotalYrs(Math.max(v, esInvYears + 1))}
                            min={esInvYears + 1} max={50} step={1} unit="Years"
                        />
                        {/* Visual indicator */}
                        <div className="es-timeline">
                            <div
                                className="es-timeline-invest"
                                style={{ width: `${(esInvYears / esTotalYrs) * 100}%` }}
                            >
                                <span>Investing ({esInvYears}y)</span>
                            </div>
                            <div
                                className="es-timeline-grow"
                                style={{ width: `${((esTotalYrs - esInvYears) / esTotalYrs) * 100}%` }}
                            >
                                <span>Growing ({esTotalYrs - esInvYears}y)</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="card">
                        <div className="card-title">Final Corpus Breakup</div>
                        <div className="chart-section">
                            <DonutChart
                                segments={esSegments}
                                size={160} thickness={32}
                                centerLabel={formatINR(esResult.finalValue)}
                                centerSub="Final Amount"
                            />
                            <div className="chart-legend">
                                {esSegments.map((s, i) => (
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

                {/* Result Cards */}
                <div className="results-grid" style={{ marginTop: 20, gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="result-card highlight">
                        <div className="result-label">Final Amount After {esTotalYrs} Years</div>
                        <div className="result-value accent">{formatINR(esResult.finalValue)}</div>
                        <div className="result-sub">Stop investing at year {esInvYears}</div>
                    </div>
                    <div className="result-card">
                        <div className="result-label">Corpus at Stop (Yr {esInvYears})</div>
                        <div className="result-value warning">{formatINR(esResult.corpusAtStop)}</div>
                        <div className="result-sub">Built in {esInvYears} years</div>
                    </div>
                    <div className="result-card">
                        <div className="result-label">Total Invested</div>
                        <div className="result-value">{formatINR(esResult.totalInvested)}</div>
                        <div className="result-sub">Only for {esInvYears} years</div>
                    </div>
                    <div className="result-card success">
                        <div className="result-label">Total Returns Earned</div>
                        <div className="result-value success">{formatINR(esResult.totalReturns)}</div>
                        <div className="result-sub">Over {esTotalYrs} years</div>
                    </div>
                </div>

                {/* Year-wise table */}
                <div className="card" style={{ marginTop: 20 }}>
                    <div className="table-title">Year-wise Growth — Investing Phase vs Growth Phase</div>
                    <div style={{ overflowX: 'auto', maxHeight: esShowAll ? '420px' : undefined }}>
                        <table className="amort-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Phase</th>
                                    <th>Total Invested</th>
                                    <th>Portfolio Value</th>
                                    <th>Gain</th>
                                </tr>
                            </thead>
                            <tbody>
                                {esDisplayRows.map(row => (
                                    <tr key={row.year} style={!row.investing ? { opacity: 0.85 } : {}}>
                                        <td>Year {row.year}</td>
                                        <td>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: 700,
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                background: row.investing ? 'rgba(59,126,248,0.12)' : 'rgba(16,185,129,0.12)',
                                                color: row.investing ? 'var(--accent-primary)' : 'var(--accent-success)',
                                            }}>
                                                {row.investing ? '💳 Investing' : '📈 Growing'}
                                            </span>
                                        </td>
                                        <td>₹{formatNumber(row.invested)}</td>
                                        <td style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                            ₹{formatNumber(row.value)}
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                                +₹{formatNumber(Math.max(0, row.value - row.invested))}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {esResult.rows.length > 8 && (
                        <button className="show-more-btn" onClick={() => setEsShowAll(v => !v)}>
                            {esShowAll ? '▲ Show Less' : `▼ Show All ${esResult.rows.length} Years`}
                        </button>
                    )}
                </div>

                <div className="info-box">
                    💡 <strong>The Power of Early Investing:</strong> By investing ₹{formatNumber(esAmount)}{FREQ_UNIT[esFreq] !== '₹' ? ' ' + FREQ_UNIT[esFreq] : ''} for just <strong>{esInvYears} years</strong>,
                    you build a corpus of <strong>{formatINR(esResult.corpusAtStop)}</strong>. Then you stop contributing — but that money
                    keeps compounding at <strong>{esRate}%</strong> for <strong>{esTotalYrs - esInvYears} more years</strong>,
                    growing to <strong>{formatINR(esResult.finalValue)}</strong>. You invested only <strong>{formatINR(esResult.totalInvested)}</strong>
                    but earned <strong>{formatINR(esResult.totalReturns)}</strong> in returns!
                </div>
            </div>
            )}
        </div>
    );
}
