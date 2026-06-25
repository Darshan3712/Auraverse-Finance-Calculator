import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { formatINR, formatNumber } from '../../utils/calculations';

/* ─────────────────────────────────────────────────────────────────────────
   MATH HELPERS
───────────────────────────────────────────────────────────────────────── */

/**
 * Section 1: How much to invest to reach a target amount?
 * - Monthly/6M/Yearly: reverse SIP (ordinary annuity, end-of-period)
 * - One-Time: present value of a lump sum
 * Returns required investment per period AND total invested.
 */
function calcRequiredInvestment(targetAmount, years, interestRate, inflationRate, frequency) {
    const r = interestRate / 100;
    const inf = inflationRate / 100;
    const n = years;

    // Future value of target adjusted for inflation (i.e. what they ACTUALLY need in future money)
    // If user types "I want ₹50 Lakh", that IS the future target — no inflation on top needed.
    // But we show the real (today's) purchasing power separately.
    const fv = targetAmount;

    let required = 0;
    let totalInvested = 0;
    let periodLabel = '';
    let periods = 0;

    if (frequency === 'lumpsum') {
        // PV = FV / (1+r)^n
        required = fv / Math.pow(1 + r, n);
        totalInvested = required;
        periodLabel = 'One-Time';
        periods = 1;
    } else if (frequency === 'monthly') {
        const rm = r / 12;
        const nm = n * 12;
        // Ordinary annuity: PMT = FV * rm / ((1+rm)^nm - 1)
        required = (rm > 0)
            ? fv * rm / (Math.pow(1 + rm, nm) - 1)
            : fv / nm;
        totalInvested = required * nm;
        periodLabel = '/month';
        periods = nm;
    } else if (frequency === 'half-yearly') {
        const r6 = Math.pow(1 + r, 0.5) - 1; // effective 6-month rate
        const n6 = n * 2;
        required = (r6 > 0)
            ? fv * r6 / (Math.pow(1 + r6, n6) - 1)
            : fv / n6;
        totalInvested = required * n6;
        periodLabel = '/6 months';
        periods = n6;
    } else {
        // yearly
        required = (r > 0)
            ? fv * r / (Math.pow(1 + r, n) - 1)
            : fv / n;
        totalInvested = required * n;
        periodLabel = '/year';
        periods = n;
    }

    const returnsEarned = fv - totalInvested;
    const realValue = fv / Math.pow(1 + inf, n); // today's purchasing power

    return {
        required: Math.round(required),
        totalInvested: Math.round(totalInvested),
        returnsEarned: Math.round(Math.max(0, returnsEarned)),
        realValue: Math.round(realValue),
        periodLabel,
        periods,
    };
}

/**
 * Section 2: If I invest X once, how much will I get?
 * FV = PV * (1+r)^n
 * Real value = FV / (1+inflation)^n
 */
function calcLumpsumGrowth(principal, years, interestRate, inflationRate) {
    const r = interestRate / 100;
    const inf = inflationRate / 100;
    const fv = principal * Math.pow(1 + r, years);
    const realValue = fv / Math.pow(1 + inf, years);
    const gains = fv - principal;

    // Year-by-year breakdown
    const yearlyBreakdown = [];
    for (let y = 1; y <= years; y++) {
        const val = principal * Math.pow(1 + r, y);
        const real = val / Math.pow(1 + inf, y);
        yearlyBreakdown.push({
            year: y,
            value: Math.round(val),
            realValue: Math.round(real),
            gains: Math.round(val - principal),
        });
    }

    return {
        futureValue: Math.round(fv),
        gains: Math.round(gains),
        realValue: Math.round(realValue),
        yearlyBreakdown,
    };
}

/* ─────────────────────────────────────────────────────────────────────────
   FREQUENCY TABS
───────────────────────────────────────────────────────────────────────── */
const FREQUENCIES = [
    { id: 'monthly',      label: 'Monthly',   icon: '📅' },
    { id: 'half-yearly',  label: '6 Months',  icon: '🗓️' },
    { id: 'yearly',       label: 'Yearly',    icon: '📆' },
    { id: 'lumpsum',      label: 'One-Time',  icon: '💰' },
];

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
   SECTION 1 – Target Amount → How Much to Invest
───────────────────────────────────────────────────────────────────────── */
function Section1() {
    const [targetAmount,  setTargetAmount]  = useState(5000000);   // ₹50 Lakh
    const [years,         setYears]         = useState(20);
    const [interestRate,  setInterestRate]  = useState(12);
    const [inflationRate, setInflationRate] = useState(6);
    const [frequency,     setFrequency]     = useState('monthly');
    const [showAll,       setShowAll]       = useState(false);

    const result = useMemo(
        () => calcRequiredInvestment(targetAmount, years, interestRate, inflationRate, frequency),
        [targetAmount, years, interestRate, inflationRate, frequency]
    );

    const segments = [
        { value: result.totalInvested,  color: '#4f8ef7', label: 'Total Invested' },
        { value: result.returnsEarned,  color: '#10b981', label: 'Returns Earned' },
    ];

    // Year-by-year breakdown for section 1
    const yearlyBreakdown = useMemo(() => {
        const r = interestRate / 100;
        const rows = [];
        for (let y = 1; y <= years; y++) {
            let accum = 0;
            const req = result.required;
            if (frequency === 'lumpsum') {
                accum = req * Math.pow(1 + r, y);
            } else if (frequency === 'monthly') {
                const rm = r / 12;
                const nm = y * 12;
                accum = rm > 0 ? req * (Math.pow(1 + rm, nm) - 1) / rm : req * nm;
            } else if (frequency === 'half-yearly') {
                const r6 = Math.pow(1 + r, 0.5) - 1;
                const n6 = y * 2;
                accum = r6 > 0 ? req * (Math.pow(1 + r6, n6) - 1) / r6 : req * n6;
            } else {
                accum = r > 0 ? req * (Math.pow(1 + r, y) - 1) / r : req * y;
            }
            const invested = frequency === 'lumpsum' ? req
                : frequency === 'monthly' ? req * y * 12
                : frequency === 'half-yearly' ? req * y * 2
                : req * y;
            rows.push({
                year: y,
                invested: Math.round(invested),
                value: Math.round(accum),
            });
        }
        return rows;
    }, [result.required, years, interestRate, frequency]);

    const displayRows = showAll ? yearlyBreakdown : yearlyBreakdown.slice(0, 5);

    const freqLabel = frequency === 'lumpsum' ? 'One-Time Investment Needed'
        : frequency === 'monthly' ? 'Monthly Investment Needed'
        : frequency === 'half-yearly' ? 'Investment Every 6 Months'
        : 'Yearly Investment Needed';

    return (
        <div className="pension-section-body">
            {/* Section banner */}
            <div className="pension-section-header" style={{ borderLeftColor: 'var(--accent-primary)' }}>
                <span className="pension-section-icon">🎯</span>
                <div>
                    <div className="pension-section-title">How much should I invest to reach my target?</div>
                    <div className="pension-section-sub">
                        Enter the amount you want, timeframe, expected return and inflation — choose how you want to invest.
                    </div>
                </div>
            </div>

            {/* Investment Frequency */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title">How will you invest?</div>
                <FreqTabs value={frequency} onChange={setFrequency} />
            </div>

            <div className="calc-grid">
                {/* Inputs */}
                <div className="card">
                    <div className="card-title">Your Goal</div>
                    <SliderInput
                        label="Target Amount You Want (₹)"
                        value={targetAmount}
                        onChange={setTargetAmount}
                        min={100000} max={100000000} step={100000} unit="₹"
                    />
                    <SliderInput
                        label="Investment Period"
                        value={years}
                        onChange={setYears}
                        min={1} max={40} step={1} unit="Years"
                    />
                    <SliderInput
                        label="Expected Annual Interest Rate"
                        value={interestRate}
                        onChange={setInterestRate}
                        min={1} max={30} step={0.5} unit="%"
                    />
                    <SliderInput
                        label="Inflation Rate"
                        value={inflationRate}
                        onChange={setInflationRate}
                        min={0} max={15} step={0.5} unit="%"
                    />
                </div>

                {/* Chart */}
                <div className="card">
                    <div className="card-title">Investment Breakup</div>
                    <div className="chart-section">
                        <DonutChart
                            segments={segments}
                            size={160} thickness={32}
                            centerLabel={formatINR(targetAmount)}
                            centerSub="Target Amount"
                        />
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

            {/* Result Cards */}
            <div className="results-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 20 }}>
                <div className="result-card highlight">
                    <div className="result-label">{freqLabel}</div>
                    <div className="result-value accent">₹{formatNumber(result.required)}</div>
                    <div className="result-sub">
                        {frequency === 'lumpsum' ? 'Invest once today' : `For ${years} years`}
                    </div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Amount Invested</div>
                    <div className="result-value warning">{formatINR(result.totalInvested)}</div>
                    <div className="result-sub">Your total contribution</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Today's Worth of ₹{formatINR(targetAmount)}</div>
                    <div className="result-value success">{formatINR(result.realValue)}</div>
                    <div className="result-sub">After {inflationRate}% inflation over {years} yrs</div>
                </div>
            </div>

            {/* Year-wise Table */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Year-wise Growth Breakdown</div>
                <div style={{ overflowX: 'auto', maxHeight: showAll ? '360px' : undefined }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Total Invested</th>
                                <th>Value of Investment</th>
                                <th>Profit / Gain</th>
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
                    <button className="show-more-btn" onClick={() => setShowAll(v => !v)}>
                        {showAll ? '▲ Show Less' : `▼ Show All ${yearlyBreakdown.length} Years`}
                    </button>
                )}
            </div>

            <div className="info-box">
                💡 To accumulate <strong>₹{formatNumber(targetAmount)}</strong> in <strong>{years} years</strong> at <strong>{interestRate}%</strong> annual return,
                you need to invest <strong>₹{formatNumber(result.required)}{result.periodLabel}</strong>.
                You'll invest a total of <strong>{formatINR(result.totalInvested)}</strong> and earn <strong>{formatINR(result.returnsEarned)}</strong> as returns.
                Due to <strong>{inflationRate}%</strong> inflation, your target of {formatINR(targetAmount)} will have the purchasing power of <strong>{formatINR(result.realValue)}</strong> in today's money.
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   SECTION 2 – One-Time Investment → How Much Will I Get?
───────────────────────────────────────────────────────────────────────── */
function Section2() {
    const [principal,     setPrincipal]     = useState(500000);    // ₹5 Lakh
    const [years,         setYears]         = useState(20);
    const [interestRate,  setInterestRate]  = useState(12);
    const [inflationRate, setInflationRate] = useState(6);
    const [showAll,       setShowAll]       = useState(false);

    const result = useMemo(
        () => calcLumpsumGrowth(principal, years, interestRate, inflationRate),
        [principal, years, interestRate, inflationRate]
    );

    const segments = [
        { value: principal,     color: '#4f8ef7', label: 'Amount Invested' },
        { value: result.gains,  color: '#10b981', label: 'Returns Earned' },
    ];

    const displayRows = showAll ? result.yearlyBreakdown : result.yearlyBreakdown.slice(0, 5);

    return (
        <div className="pension-section-body">
            {/* Section banner */}
            <div className="pension-section-header" style={{ borderLeftColor: 'var(--accent-success)' }}>
                <span className="pension-section-icon">💹</span>
                <div>
                    <div className="pension-section-title">How much will I get from a one-time investment?</div>
                    <div className="pension-section-sub">
                        Enter the amount you invest once, the period, interest rate and inflation — see what you'll receive.
                    </div>
                </div>
            </div>

            <div className="calc-grid">
                {/* Inputs */}
                <div className="card">
                    <div className="card-title">Investment Details</div>
                    <SliderInput
                        label="Amount You Invest (One-Time)"
                        value={principal}
                        onChange={setPrincipal}
                        min={10000} max={50000000} step={10000} unit="₹"
                    />
                    <SliderInput
                        label="Investment Period"
                        value={years}
                        onChange={setYears}
                        min={1} max={40} step={1} unit="Years"
                    />
                    <SliderInput
                        label="Expected Annual Interest Rate"
                        value={interestRate}
                        onChange={setInterestRate}
                        min={1} max={30} step={0.5} unit="%"
                    />
                    <SliderInput
                        label="Inflation Rate"
                        value={inflationRate}
                        onChange={setInflationRate}
                        min={0} max={15} step={0.5} unit="%"
                    />
                </div>

                {/* Chart */}
                <div className="card">
                    <div className="card-title">Returns Breakup</div>
                    <div className="chart-section">
                        <DonutChart
                            segments={segments}
                            size={160} thickness={32}
                            centerLabel={formatINR(result.futureValue)}
                            centerSub="You Will Get"
                        />
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

            {/* Result Cards */}
            <div className="results-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 20 }}>
                <div className="result-card highlight">
                    <div className="result-label">Total Amount You Will Get</div>
                    <div className="result-value accent">{formatINR(result.futureValue)}</div>
                    <div className="result-sub">After {years} years at {interestRate}%</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Profit / Returns Earned</div>
                    <div className="result-value success">{formatINR(result.gains)}</div>
                    <div className="result-sub">On ₹{formatNumber(principal)} invested</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Real Value (Today's Money)</div>
                    <div className="result-value warning">{formatINR(result.realValue)}</div>
                    <div className="result-sub">After {inflationRate}% inflation over {years} yrs</div>
                </div>
            </div>

            {/* Year-wise Table */}
            <div className="card" style={{ marginTop: 20 }}>
                <div className="table-title">Year-wise Growth Breakdown</div>
                <div style={{ overflowX: 'auto', maxHeight: showAll ? '360px' : undefined }}>
                    <table className="amort-table">
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th>Investment Value</th>
                                <th>Profit So Far</th>
                                <th>Real Value (Today's ₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayRows.map(row => (
                                <tr key={row.year}>
                                    <td>Year {row.year}</td>
                                    <td style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                        ₹{formatNumber(row.value)}
                                    </td>
                                    <td>
                                        <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                            +₹{formatNumber(row.gains)}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--accent-warning)' }}>
                                        ₹{formatNumber(row.realValue)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {result.yearlyBreakdown.length > 5 && (
                    <button className="show-more-btn" onClick={() => setShowAll(v => !v)}>
                        {showAll ? '▲ Show Less' : `▼ Show All ${result.yearlyBreakdown.length} Years`}
                    </button>
                )}
            </div>

            <div className="info-box">
                💡 Investing <strong>₹{formatNumber(principal)}</strong> once at <strong>{interestRate}%</strong> annual return for <strong>{years} years</strong> will
                grow to <strong>{formatINR(result.futureValue)}</strong>. That's a profit of <strong>{formatINR(result.gains)}</strong>.
                However, due to <strong>{inflationRate}%</strong> inflation, the real purchasing power of that amount will be <strong>{formatINR(result.realValue)}</strong> in today's money.
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function PensionCalculator() {
    const [activeSection, setActiveSection] = useState(1);

    return (
        <div className="calc-container">
            <h1 className="calc-title">🧓 Pension Calculator</h1>
            <p className="calc-subtitle">
                Plan your retirement savings. Find out how much to invest to reach a target amount,
                or see how much a one-time investment will grow — both inflation-adjusted.
            </p>

            {/* Section Tabs */}
            <div className="pension-section-tabs">
                <button
                    id="pension-tab-1"
                    className={`pension-tab${activeSection === 1 ? ' active' : ''}`}
                    onClick={() => setActiveSection(1)}
                >
                    <span className="pension-tab-num">1</span>
                    <div>
                        <div className="pension-tab-title">I Want a Target Amount</div>
                        <div className="pension-tab-sub">How much should I invest to reach ₹X?</div>
                    </div>
                </button>
                <button
                    id="pension-tab-2"
                    className={`pension-tab${activeSection === 2 ? ' active' : ''}`}
                    onClick={() => setActiveSection(2)}
                >
                    <span className="pension-tab-num">2</span>
                    <div>
                        <div className="pension-tab-title">I Invest Once</div>
                        <div className="pension-tab-sub">How much will I get from a lump sum?</div>
                    </div>
                </button>
            </div>

            {activeSection === 1 ? <Section1 /> : <Section2 />}
        </div>
    );
}
