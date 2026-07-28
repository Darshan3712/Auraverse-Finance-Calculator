import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { formatINR, formatNumber } from '../../utils/calculations';

/* ─────────────────────────────────────────────────────────────────────────
   MATH HELPERS
───────────────────────────────────────────────────────────────────────── */

/**
 * Corpus needed at retirement to fund monthly withdrawals.
 * PV of ordinary annuity: Corpus = PMT × [(1 - (1+r)^-n) / r]
 */
function calcCorpusNeeded(desiredMonthly, postReturnRate, retirementDurationYears) {
    const r = postReturnRate / 12 / 100;
    const n = retirementDurationYears * 12;
    if (r === 0) return desiredMonthly * n;
    return desiredMonthly * ((1 - Math.pow(1 + r, -n)) / r);
}

/**
 * Monthly SIP to accumulate the target corpus.
 * Reverse SIP (annuity-due): SIP = Corpus × r / [((1+r)^n - 1) × (1+r)]
 */
function calcSIPRequired(corpus, preReturnRate, yearsToRetirement) {
    const r = preReturnRate / 12 / 100;
    const n = yearsToRetirement * 12;
    if (r === 0) return corpus / n;
    return corpus * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
}

/**
 * Year-wise corpus accumulation during SIP phase.
 */
function calcAccumulationTable(monthlySIP, preReturnRate, yearsToRetirement) {
    const r = preReturnRate / 12 / 100;
    const rows = [];
    for (let y = 1; y <= yearsToRetirement; y++) {
        const n = y * 12;
        const fv = r > 0
            ? monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
            : monthlySIP * n;
        const invested = monthlySIP * n;
        rows.push({
            year: y,
            invested: Math.round(invested),
            corpus: Math.round(fv),
            returns: Math.round(fv - invested),
        });
    }
    return rows;
}

/**
 * Year-wise corpus depletion during withdrawal phase.
 */
function calcWithdrawalTable(corpus, desiredMonthly, postReturnRate, retirementDurationYears) {
    const r = postReturnRate / 12 / 100;
    let balance = corpus;
    const rows = [];
    for (let y = 1; y <= retirementDurationYears; y++) {
        const openingBalance = balance;
        let totalWithdrawn = 0;
        let totalInterest = 0;
        for (let m = 0; m < 12; m++) {
            if (balance <= 0) break;
            const interest = balance * r;
            totalInterest += interest;
            balance = balance + interest - desiredMonthly;
            totalWithdrawn += desiredMonthly;
        }
        rows.push({
            year: y,
            openingBalance: Math.round(openingBalance),
            withdrawn: Math.round(totalWithdrawn),
            interestEarned: Math.round(totalInterest),
            closingBalance: Math.max(0, Math.round(balance)),
        });
        if (balance <= 0) break;
    }
    return rows;
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function RetirementPlanning() {
    const [currentAge,         setCurrentAge]         = useState(30);
    const [retirementAge,      setRetirementAge]      = useState(60);
    const [desiredMonthly,     setDesiredMonthly]     = useState(50000);
    const [retirementDuration, setRetirementDuration] = useState(25);
    const [preReturnRate,      setPreReturnRate]      = useState(12);
    const [postReturnRate,     setPostReturnRate]     = useState(7);

    const [activeTab,    setActiveTab]    = useState('accumulation');
    const [showAccFull,  setShowAccFull]  = useState(false);
    const [showWdFull,   setShowWdFull]   = useState(false);

    const yearsToRetirement = retirementAge - currentAge;

    /* ── Core calculations ── */
    const corpus = useMemo(
        () => calcCorpusNeeded(desiredMonthly, postReturnRate, retirementDuration),
        [desiredMonthly, postReturnRate, retirementDuration]
    );

    const monthlySIP = useMemo(
        () => calcSIPRequired(corpus, preReturnRate, yearsToRetirement),
        [corpus, preReturnRate, yearsToRetirement]
    );

    const totalSIPInvested  = Math.round(monthlySIP * yearsToRetirement * 12);
    const returnsFromSIP    = Math.round(corpus - totalSIPInvested);
    const totalWithdrawn    = desiredMonthly * retirementDuration * 12;

    /* ── Tables ── */
    const accTable = useMemo(
        () => calcAccumulationTable(monthlySIP, preReturnRate, yearsToRetirement),
        [monthlySIP, preReturnRate, yearsToRetirement]
    );

    const wdTable = useMemo(
        () => calcWithdrawalTable(corpus, desiredMonthly, postReturnRate, retirementDuration),
        [corpus, desiredMonthly, postReturnRate, retirementDuration]
    );

    const accDisplay = showAccFull ? accTable : accTable.slice(0, 5);
    const wdDisplay  = showWdFull  ? wdTable  : wdTable.slice(0, 5);

    /* ── Chart segments ── */
    const accSegments = [
        { value: totalSIPInvested,             color: '#3b7ef8', label: 'Total SIP Invested' },
        { value: Math.max(0, returnsFromSIP),  color: '#10b981', label: 'Returns Earned' },
    ];

    const wdSegments = [
        { value: totalWithdrawn,                       color: '#f59e0b', label: 'Total Withdrawn' },
        { value: Math.max(0, corpus - totalWithdrawn), color: '#10b981', label: 'Leftover Corpus' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">👴 Retirement Planning Calculator</h1>
            <p className="calc-subtitle">
                Decide your monthly income at retirement → we calculate the exact SIP to start today.
                Your SIP builds a retirement corpus, from which you withdraw every month.
            </p>

            {/* ── INPUTS ── */}
            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Your Retirement Plan</div>
                    <SliderInput
                        label="Current Age"
                        value={currentAge}
                        onChange={v => setCurrentAge(Math.min(v, retirementAge - 1))}
                        min={20} max={60} step={1} unit="Years"
                    />
                    <SliderInput
                        label="Desired Retirement Age"
                        value={retirementAge}
                        onChange={v => setRetirementAge(Math.max(v, currentAge + 1))}
                        min={currentAge + 1} max={70} step={1} unit="Years"
                    />
                    <SliderInput
                        label="Desired Monthly Income at Retirement"
                        value={desiredMonthly}
                        onChange={setDesiredMonthly}
                        min={10000} max={500000} step={5000} unit="₹/mo"
                    />
                    <SliderInput
                        label="Retirement Duration (Withdrawal Period)"
                        value={retirementDuration}
                        onChange={setRetirementDuration}
                        min={5} max={40} step={1} unit="Years"
                    />
                    <div className="section-divider" />
                    <SliderInput
                        label="Pre-Retirement Return (SIP phase)"
                        value={preReturnRate}
                        onChange={setPreReturnRate}
                        min={6} max={20} step={0.5} unit="%"
                    />
                    <SliderInput
                        label="Post-Retirement Return (Withdrawal phase)"
                        value={postReturnRate}
                        onChange={setPostReturnRate}
                        min={3} max={12} step={0.25} unit="%"
                    />
                </div>

                {/* ── RIGHT: Chart ── */}
                <div className="card">
                    <div className="card-title">Corpus Breakup at Retirement</div>

                    {/* Timeline visual */}
                    <div className="es-timeline" style={{ marginBottom: 20 }}>
                        <div
                            className="es-timeline-invest"
                            style={{ width: `${(yearsToRetirement / (yearsToRetirement + retirementDuration)) * 100}%` }}
                        >
                            <span>💳 SIP Phase ({yearsToRetirement}y)</span>
                        </div>
                        <div
                            className="es-timeline-grow"
                            style={{ width: `${(retirementDuration / (yearsToRetirement + retirementDuration)) * 100}%` }}
                        >
                            <span>💸 Withdrawal ({retirementDuration}y)</span>
                        </div>
                    </div>

                    <div className="chart-section">
                        <DonutChart
                            segments={accSegments}
                            size={160} thickness={32}
                            centerLabel={formatINR(Math.round(corpus))}
                            centerSub="Corpus at Retirement"
                        />
                        <div className="chart-legend">
                            {accSegments.map((s, i) => (
                                <div className="legend-item" key={i}>
                                    <div className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-label">{s.label}</span>
                                    <span className="legend-value">{formatINR(Math.max(0, s.value))}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RESULT CARDS ── */}
            <div className="results-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 20 }}>
                <div className="result-card highlight">
                    <div className="result-label">Monthly SIP to Start Now</div>
                    <div className="result-value accent">₹{formatNumber(Math.round(monthlySIP))}</div>
                    <div className="result-sub">For {yearsToRetirement} years</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Corpus at Retirement</div>
                    <div className="result-value warning">{formatINR(Math.round(corpus))}</div>
                    <div className="result-sub">Built at age {retirementAge}</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Monthly Withdrawal</div>
                    <div className="result-value success">₹{formatNumber(desiredMonthly)}</div>
                    <div className="result-sub">For {retirementDuration} years</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Total Amount Withdrawn</div>
                    <div className="result-value">{formatINR(totalWithdrawn)}</div>
                    <div className="result-sub">Over retirement period</div>
                </div>
            </div>

            {/* ── INFO BOX ── */}
            <div className="info-box" style={{ marginTop: 16 }}>
                💡 You invest <strong>₹{formatNumber(Math.round(monthlySIP))}/month</strong> for <strong>{yearsToRetirement} years</strong> at <strong>{preReturnRate}%</strong> p.a.,
                building a corpus of <strong>{formatINR(Math.round(corpus))}</strong> by age {retirementAge}.
                This corpus earns <strong>{postReturnRate}%</strong> p.a. and pays you <strong>₹{formatNumber(desiredMonthly)}/month</strong> for <strong>{retirementDuration} years</strong>
                — total withdrawals of <strong>{formatINR(totalWithdrawn)}</strong>.
            </div>

            {/* ── PHASE TABS ── */}
            <div className="sip-top-tabs" style={{ marginTop: 24 }}>
                <button
                    className={`sip-top-tab${activeTab === 'accumulation' ? ' active' : ''}`}
                    onClick={() => setActiveTab('accumulation')}
                >
                    <span>📈</span>
                    <div>
                        <div className="sip-top-tab-title">Accumulation Phase</div>
                        <div className="sip-top-tab-sub">SIP building your corpus year by year</div>
                    </div>
                </button>
                <button
                    className={`sip-top-tab${activeTab === 'withdrawal' ? ' active' : ''}`}
                    onClick={() => setActiveTab('withdrawal')}
                >
                    <span>💸</span>
                    <div>
                        <div className="sip-top-tab-title">Withdrawal Phase</div>
                        <div className="sip-top-tab-sub">Monthly income from corpus</div>
                    </div>
                </button>
            </div>

            {/* ── ACCUMULATION TABLE ── */}
            {activeTab === 'accumulation' && (
                <div className="card" style={{ marginTop: 0 }}>
                    <div className="table-title">Year-wise SIP Accumulation (Age {currentAge} → {retirementAge})</div>
                    <div style={{ overflowX: 'auto', maxHeight: showAccFull ? '400px' : undefined }}>
                        <table className="amort-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Age</th>
                                    <th>Total Invested</th>
                                    <th>Returns Earned</th>
                                    <th>Corpus Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accDisplay.map(row => (
                                    <tr key={row.year}>
                                        <td>Year {row.year}</td>
                                        <td>{currentAge + row.year}</td>
                                        <td>₹{formatNumber(row.invested)}</td>
                                        <td>
                                            <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                                +₹{formatNumber(row.returns)}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--accent-success)', fontWeight: 700 }}>
                                            ₹{formatNumber(row.corpus)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {accTable.length > 5 && (
                        <button className="show-more-btn" onClick={() => setShowAccFull(v => !v)}>
                            {showAccFull ? '▲ Show Less' : `▼ Show All ${accTable.length} Years`}
                        </button>
                    )}
                </div>
            )}

            {/* ── WITHDRAWAL TABLE ── */}
            {activeTab === 'withdrawal' && (
                <div className="card" style={{ marginTop: 0 }}>
                    <div className="table-title">Year-wise Corpus Withdrawal (Age {retirementAge} → {retirementAge + retirementDuration})</div>

                    {/* Withdrawal donut */}
                    <div className="chart-section" style={{ marginBottom: 20 }}>
                        <DonutChart
                            segments={wdSegments}
                            size={140} thickness={28}
                            centerLabel={formatINR(totalWithdrawn)}
                            centerSub="Total Withdrawn"
                        />
                        <div className="chart-legend">
                            {wdSegments.map((s, i) => (
                                <div className="legend-item" key={i}>
                                    <div className="legend-dot" style={{ background: s.color }} />
                                    <span className="legend-label">{s.label}</span>
                                    <span className="legend-value">{formatINR(Math.max(0, s.value))}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto', maxHeight: showWdFull ? '400px' : undefined }}>
                        <table className="amort-table">
                            <thead>
                                <tr>
                                    <th>Year</th>
                                    <th>Age</th>
                                    <th>Opening Corpus</th>
                                    <th>Interest Earned</th>
                                    <th>Withdrawn</th>
                                    <th>Closing Corpus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wdDisplay.map(row => (
                                    <tr key={row.year}>
                                        <td>Year {row.year}</td>
                                        <td>{retirementAge + row.year - 1}</td>
                                        <td>₹{formatNumber(row.openingBalance)}</td>
                                        <td>
                                            <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                                +₹{formatNumber(row.interestEarned)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                                                −₹{formatNumber(row.withdrawn)}
                                            </span>
                                        </td>
                                        <td style={{
                                            color: row.closingBalance > 0 ? 'var(--accent-success)' : '#ef4444',
                                            fontWeight: 700
                                        }}>
                                            ₹{formatNumber(row.closingBalance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {wdTable.length > 5 && (
                        <button className="show-more-btn" onClick={() => setShowWdFull(v => !v)}>
                            {showWdFull ? '▲ Show Less' : `▼ Show All ${wdTable.length} Years`}
                        </button>
                    )}
                </div>
            )}

            <div className="info-box" style={{ marginBottom: 32 }}>
                📌 <strong>How this works:</strong> Phase 1 — You invest <strong>₹{formatNumber(Math.round(monthlySIP))}/mo</strong> SIP for {yearsToRetirement} years.
                At age {retirementAge} you stop investing and have <strong>{formatINR(Math.round(corpus))}</strong> as your retirement lump sum.
                Phase 2 — This corpus stays invested at {postReturnRate}% p.a. and pays you <strong>₹{formatNumber(desiredMonthly)}/month</strong>
                for {retirementDuration} years (till age {retirementAge + retirementDuration}).
            </div>
        </div>
    );
}
