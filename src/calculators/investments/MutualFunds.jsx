import { useState, useMemo } from 'react';
import SliderInput from '../../components/SliderInput';
import DonutChart from '../../components/DonutChart';
import { calculateMutualFund, calculateSIP, formatINR, formatNumber } from '../../utils/calculations';

export default function MutualFunds() {
    const [mode, setMode] = useState('lumpsum'); // 'lumpsum' | 'sip'
    const [amount, setAmount] = useState(100000);
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    const lsResult = useMemo(() => calculateMutualFund(amount, rate, years), [amount, rate, years]);
    const sipResult = useMemo(() => calculateSIP(amount, rate, years), [amount, rate, years]);

    const result = mode === 'lumpsum' ? lsResult : sipResult;
    const invested = mode === 'lumpsum' ? amount : sipResult.invested;
    const gains = mode === 'lumpsum' ? lsResult.gains : sipResult.returns;

    const segments = [
        { value: invested, color: '#4f8ef7', label: mode === 'lumpsum' ? 'Principal' : 'Total SIP Invested' },
        { value: gains, color: '#10b981', label: 'Gains / Returns' },
    ];

    return (
        <div className="calc-container">
            <h1 className="calc-title">💰 Mutual Fund Calculator</h1>
            <p className="calc-subtitle">Calculate expected returns for both Lump-sum investment and SIP (Systematic Investment Plan) in mutual funds.</p>

            <div className="strategy-tabs">
                <button className={`strategy-tab${mode === 'lumpsum' ? ' active' : ''}`} onClick={() => { setMode('lumpsum'); setAmount(100000); }}>Lump-sum Investment</button>
                <button className={`strategy-tab${mode === 'sip' ? ' active' : ''}`} onClick={() => { setMode('sip'); setAmount(5000); }}>SIP (Monthly)</button>
            </div>

            <div className="calc-grid">
                <div className="card">
                    <div className="card-title">Investment Details</div>
                    <SliderInput
                        label={mode === 'lumpsum' ? 'Investment Amount' : 'Monthly SIP Amount'}
                        value={amount} onChange={setAmount}
                        min={mode === 'lumpsum' ? 5000 : 500}
                        max={mode === 'lumpsum' ? 10000000 : 100000}
                        step={mode === 'lumpsum' ? 5000 : 500}
                        unit="₹"
                    />
                    <SliderInput label="Expected Annual Return" value={rate} onChange={setRate} min={5} max={30} step={0.5} unit="%" />
                    <SliderInput label="Investment Period" value={years} onChange={setYears} min={1} max={30} step={1} unit="Years" />
                </div>

                <div className="card">
                    <div className="card-title">Breakup</div>
                    <div className="chart-section">
                        <DonutChart segments={segments} size={160} thickness={32}
                            centerLabel={formatINR(result.maturity || result.futureValue)} centerSub="Total Value" />
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
                    <div className="result-label">Future Value</div>
                    <div className="result-value accent">{formatINR(result.maturity || result.futureValue)}</div>
                </div>
                <div className="result-card">
                    <div className="result-label">Amount Invested</div>
                    <div className="result-value">₹{formatNumber(invested)}</div>
                </div>
                <div className="result-card success">
                    <div className="result-label">Total Gains</div>
                    <div className="result-value success">₹{formatNumber(gains)}</div>
                    <div className="result-sub">{((gains / invested) * 100).toFixed(1)}% gain</div>
                </div>
            </div>

            <div className="info-box">
                💡 <strong>Note:</strong> Returns are market-linked and not guaranteed. Historical large-cap MF returns: 10–14% p.a. Equity SIP is ideal for 5+ years due to rupee cost averaging. LTCG beyond ₹1L is taxed at 10% in equity funds.
            </div>
        </div>
    );
}
