import { useState, useEffect, useCallback } from 'react';
import { useAppState } from '../../context/AppContext';

const API_BASE = 'http://localhost:8000';

// ── Complete fallback filter data built from uploaded CSV files ──
const FALLBACK_FILTERS = {
    topology: {
        Kerala: ['Kottayam', 'Kozhikode', 'Palakad'],
        Maharastra: ['Sholapur'],
        Tamilnadu: ['Coimbatore', 'Thanjavur'],
    },
    commodities: {
        Kerala_Kottayam: ['Amaranthus', 'Amphophalus', 'Apple', 'Arecanut(Betelnut/Supari)', 'Ashgourd', 'Banana', 'Banana - Green', 'Beans', 'Beetroot', 'Bengal Gram(Gram)(Whole)', 'Betal Leaves', 'Bhindi(Ladies Finger)', 'Bitter gourd', 'Black Gram (Urd Beans)(Whole)', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Capsicum', 'Carrot', 'Cauliflower', 'Coconut', 'Coriander(Leaves)', 'Cowpea(Lobia/Karamani)', 'Cucumber', 'Drumstick', 'Elephant Yam (Suran)', 'Garlic', 'Ginger(Dry)', 'Ginger(Green)', 'Grapes', 'Green Gram (Moong)(Whole)', 'Guava', 'Jack Fruit', 'Lemon', 'Mango', 'Onion', 'Orange', 'Papaya', 'Pineapple', 'Pomegranate', 'Potato', 'Pumpkin', 'Raddish', 'Snake Gourd', 'Sponge gourd', 'Sweet Potato', 'Tapioca', 'Tomato', 'Watermelon', 'Yam(Ratalu)'],
        Kerala_Kozhikode: ['Alsandikai', 'Amaranthus', 'Amphophalus', 'Apple', 'Arecanut(Betelnut/Supari)', 'Arhar (Tur/Red Gram)(Whole)', 'Ashgourd', 'Banana', 'Banana - Green', 'Beans', 'Beetroot', 'Bengal Gram(Gram)(Whole)', 'Betal Leaves', 'Bhindi(Ladies Finger)', 'Bitter gourd', 'Black Gram (Urd Beans)(Whole)', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Capsicum', 'Carrot', 'Cauliflower', 'Coconut', 'Coriander(Leaves)', 'Cowpea(Lobia/Karamani)', 'Cucumber', 'Drumstick', 'Elephant Yam (Suran)', 'Garlic', 'Ginger(Dry)', 'Ginger(Green)', 'Grapes', 'Green Gram (Moong)(Whole)', 'Guava', 'Jack Fruit', 'Lemon', 'Mango', 'Onion', 'Orange', 'Papaya', 'Pineapple', 'Pomegranate', 'Potato', 'Pumpkin', 'Raddish', 'Snake Gourd', 'Tomato', 'Watermelon', 'Yam(Ratalu)'],
        Kerala_Palakad: ['Amaranthus', 'Amla(Nelli Kai)', 'Amphophalus', 'Apple', 'Arecanut(Betelnut/Supari)', 'Arhar (Tur/Red Gram)(Whole)', 'Ashgourd', 'Banana', 'Banana - Green', 'Beans', 'Beetroot', 'Bengal Gram(Gram)(Whole)', 'Bhindi(Ladies Finger)', 'Bitter gourd', 'Black Gram (Urd Beans)(Whole)', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Capsicum', 'Carrot', 'Cauliflower', 'Coconut', 'Coriander(Leaves)', 'Cowpea(Lobia/Karamani)', 'Cucumber', 'Drumstick', 'Elephant Yam (Suran)', 'Garlic', 'Ginger(Dry)', 'Ginger(Green)', 'Grapes', 'Green Gram (Moong)(Whole)', 'Guava', 'Jack Fruit', 'Lemon', 'Mango', 'Onion', 'Orange', 'Papaya', 'Pineapple', 'Pomegranate', 'Potato', 'Pumpkin', 'Raddish', 'Snake Gourd', 'Tomato', 'Watermelon', 'Yam(Ratalu)'],
        Maharastra_Sholapur: ['Apple', 'Arecanut(Betelnut/Supari)', 'Arhar (Tur/Red Gram)(Whole)', 'Bajra(Pearl Millet/Cumbu)', 'Banana', 'Banana - Green', 'Barley (Jau)', 'Beans', 'Beetroot', 'Bengal Gram(Gram)(Whole)', 'Bhindi(Ladies Finger)', 'Bitter gourd', 'Black Gram (Urd Beans)(Whole)', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Capsicum', 'Carrot', 'Cauliflower', 'Coriander(Leaves)', 'Cowpea(Lobia/Karamani)', 'Cucumber', 'Drumstick', 'Garlic', 'Ginger(Dry)', 'Ginger(Green)', 'Grapes', 'Green Gram (Moong)(Whole)', 'Guava', 'Lemon', 'Mango', 'Onion', 'Orange', 'Papaya', 'Pineapple', 'Pomegranate', 'Potato', 'Pumpkin', 'Raddish', 'Snake Gourd', 'Tomato', 'Watermelon'],
        Tamilnadu_Coimbatore: ['Alasande Gram', 'Amaranthus', 'Amla(Nelli Kai)', 'Apple', 'Arecanut(Betelnut/Supari)', 'Arhar (Tur/Red Gram)(Whole)', 'Ashgourd', 'Bajra(Pearl Millet/Cumbu)', 'Banana', 'Banana - Green', 'Beans', 'Beetroot', 'Bengal Gram(Gram)(Whole)', 'Bhindi(Ladies Finger)', 'Bitter gourd', 'Black Gram (Urd Beans)(Whole)', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Capsicum', 'Carrot', 'Cauliflower', 'Coconut', 'Coriander(Leaves)', 'Cowpea(Lobia/Karamani)', 'Cucumber', 'Drumstick', 'Garlic', 'Ginger(Dry)', 'Ginger(Green)', 'Grapes', 'Green Gram (Moong)(Whole)', 'Guava', 'Lemon', 'Mango', 'Onion', 'Orange', 'Papaya', 'Pineapple', 'Pomegranate', 'Potato', 'Pumpkin', 'Raddish', 'Snake Gourd', 'Tomato', 'Watermelon', 'Yam(Ratalu)'],
        Tamilnadu_Thanjavur: ['Amaranthus', 'Amla(Nelli Kai)', 'Apple', 'Ashgourd', 'Banana', 'Banana - Green', 'Beans', 'Beetroot', 'Betal Leaves', 'Bhindi(Ladies Finger)', 'Bitter gourd', 'Black Gram (Urd Beans)(Whole)', 'Bottle gourd', 'Brinjal', 'Cabbage', 'Capsicum', 'Carrot', 'Cauliflower', 'Coconut', 'Coriander(Leaves)', 'Cowpea(Lobia/Karamani)', 'Cucumber', 'Drumstick', 'Garlic', 'Ginger(Dry)', 'Ginger(Green)', 'Grapes', 'Green Gram (Moong)(Whole)', 'Guava', 'Lemon', 'Mango', 'Onion', 'Orange', 'Papaya', 'Pineapple', 'Pomegranate', 'Potato', 'Pumpkin', 'Raddish', 'Snake Gourd', 'Tomato', 'Watermelon', 'Yam(Ratalu)'],
    },
};

async function fetchFilters() {
    const res = await fetch(`${API_BASE}/api/market/filters`);
    if (!res.ok) throw new Error('Could not load filters');
    return res.json();
}

async function fetchMarketIntelligence(region, commodity) {
    const params = new URLSearchParams({ region, commodity, days: 14 });
    const res = await fetch(`${API_BASE}/api/market/intelligence?${params}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Market fetch failed' }));
        throw new Error(err.detail || 'Market fetch failed');
    }
    return res.json();
}

async function fetchMarketRecords(region, commodity, page = 1, pageSize = 50) {
    const params = new URLSearchParams({ region, commodity, page, page_size: pageSize });
    const res = await fetch(`${API_BASE}/api/market/records?${params}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Records fetch failed' }));
        throw new Error(err.detail || 'Records fetch failed');
    }
    return res.json();
}

// ── Mini SVG sparkline ──
function Sparkline({ prices = [], width = 200, height = 56 }) {
    const valid = prices.filter(p => p > 0);
    if (valid.length < 2) return <span className="mi-no-chart">No chart data yet</span>;

    const min = Math.min(...valid);
    const max = Math.max(...valid);
    const range = max - min || 1;
    const step = width / (valid.length - 1);

    const points = valid
        .map((p, i) => `${i * step},${height - ((p - min) / range) * (height - 4) - 2}`)
        .join(' ');

    const isUp = valid[valid.length - 1] >= valid[0];
    const color = isUp ? '#22c55e' : '#ef4444';
    const fill = isUp ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';

    const firstPt = `0,${height}`;
    const lastPt = `${width},${height}`;
    const areaPoints = `${firstPt} ${points} ${lastPt}`;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="mi-sparkline" preserveAspectRatio="none">
            <polygon points={areaPoints} fill={fill} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {valid.length > 0 && (() => {
                const lx = (valid.length - 1) * step;
                const ly = height - ((valid[valid.length - 1] - min) / range) * (height - 4) - 2;
                return <circle cx={lx} cy={ly} r="3.5" fill={color} />;
            })()}
        </svg>
    );
}

function Skeleton({ lines = 3 }) {
    return (
        <div className="mi-skeleton-card">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className={`skeleton skeleton-${i === 0 ? 'label' : i === 1 ? 'value' : 'sub'}`} />
            ))}
        </div>
    );
}

function TrendBadge({ trend }) {
    const map = {
        up: { cls: 'up', icon: '↑', label: 'Rising' },
        down: { cls: 'down', icon: '↓', label: 'Falling' },
        stable: { cls: 'stable', icon: '→', label: 'Stable' },
    };
    const t = map[trend] || map.stable;
    return <span className={`mi-trend-badge mi-trend-${t.cls}`}>{t.icon} {t.label}</span>;
}

function RecBadge({ action }) {
    const cls = action === 'BUY' ? 'buy' : action === 'SELL' ? 'sell' : 'hold';
    return <span className={`mi-rec-badge mi-rec-${cls}`}>{action}</span>;
}

export default function MarketIntelligence() {
    const { state: appState, dispatch } = useAppState();
    const { regionId, commodityId } = appState;

    const [filterData, setFilterData] = useState({ topology: {}, commodities: {} });
    const [filtersLoading, setFiltersLoading] = useState(true);
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);

    // Records data (for the table)
    const [records, setRecords] = useState([]);
    const [recordsTotal, setRecordsTotal] = useState(0);
    const [recordsPage, setRecordsPage] = useState(1);
    const [recordsLoading, setRecordsLoading] = useState(false);
    const recordsPageSize = 50;

    useEffect(() => {
        fetchFilters()
            .then(f => {
                const topology = (f.topology && Object.keys(f.topology).length > 0)
                    ? f.topology : FALLBACK_FILTERS.topology;
                const commodities = (f.commodities && Object.keys(f.commodities).length > 0)
                    ? f.commodities : FALLBACK_FILTERS.commodities;
                setFilterData({ topology, commodities });
                setFiltersLoading(false);
                if (regionId) {
                    const parts = regionId.split('_');
                    if (parts.length >= 2) {
                        setSelectedState(parts[0]);
                        setSelectedDistrict(parts[1]);
                    }
                }
            })
            .catch(() => {
                setFilterData(FALLBACK_FILTERS);
                setFiltersLoading(false);
            });
    }, []);

    const loadRecords = useCallback((page = 1) => {
        if (!regionId || !commodityId) return;
        setRecordsLoading(true);
        fetchMarketRecords(regionId, commodityId, page, recordsPageSize)
            .then(r => {
                setRecords(r.records || []);
                setRecordsTotal(r.total || 0);
                setRecordsPage(r.page || page);
                setRecordsLoading(false);
            })
            .catch(() => { setRecords([]); setRecordsLoading(false); });
    }, [regionId, commodityId]);

    const doFetch = useCallback(() => {
        if (!regionId || !commodityId) return;
        setLoading(true);
        setError(null);
        setRecordsPage(1);

        Promise.all([
            fetchMarketIntelligence(regionId, commodityId),
            fetchMarketRecords(regionId, commodityId, 1, recordsPageSize),
        ])
            .then(([intel, recs]) => {
                setData(intel);
                setRecords(recs.records || []);
                setRecordsTotal(recs.total || 0);
                setRecordsPage(recs.page || 1);
                setLoading(false);
                setHasFetched(true);
            })
            .catch(e => { setError(e.message); setLoading(false); });
    }, [regionId, commodityId]);

    const handleStateChange = (e) => {
        const newState = e.target.value;
        setSelectedState(newState);
        const districts = filterData.topology[newState] || [];
        const newDistrict = districts.length > 0 ? districts[0] : '';
        setSelectedDistrict(newDistrict);
        if (newDistrict) {
            const newRegion = `${newState}_${newDistrict}`;
            const comms = filterData.commodities[newRegion] || [];
            const newComm = comms.length > 0 ? comms[0] : '';
            dispatch({ type: 'SET_FILTER', payload: { regionId: newRegion, commodityId: newComm } });
        }
    };

    const handleDistrictChange = (e) => {
        const newDistrict = e.target.value;
        setSelectedDistrict(newDistrict);
        const newRegion = `${selectedState}_${newDistrict}`;
        const comms = filterData.commodities[newRegion] || [];
        const newComm = comms.length > 0 ? comms[0] : '';
        dispatch({ type: 'SET_FILTER', payload: { regionId: newRegion, commodityId: newComm } });
    };

    const handleCommodityChange = (e) => {
        dispatch({ type: 'SET_FILTER', payload: { regionId, commodityId: e.target.value } });
    };

    const handlePageChange = (newPage) => {
        setRecordsPage(newPage);
        loadRecords(newPage);
    };

    const stateList = Object.keys(filterData.topology);
    const districtList = selectedState ? (filterData.topology[selectedState] || []) : [];
    const availableCommodities = (selectedState && selectedDistrict)
        ? (filterData.commodities[`${selectedState}_${selectedDistrict}`] || []) : [];

    const card = data?.price_card || {};
    const mom = data?.momentum || {};
    const rec = data?.recommendation || {};
    const chart = data?.chart || {};

    const totalPages = Math.ceil(recordsTotal / recordsPageSize);
    const showFrom = recordsTotal > 0 ? (recordsPage - 1) * recordsPageSize + 1 : 0;
    const showTo = Math.min(recordsPage * recordsPageSize, recordsTotal);

    return (
        <div className="mi-page">
            {/* ── Header ── */}
            <div className="mi-header">
                <div className="mi-header-left">
                    <div className="mi-header-badge"><span className="mi-dot" /> Live Mandi Data</div>
                    <h1 className="mi-title">Market Intelligence</h1>
                    <p className="mi-subtitle">Real-time mandi prices from uploaded region files</p>
                </div>
                <div className="mi-header-right">
                    <span className="mi-source-tag">CSV Data Source</span>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="mi-filter-bar mi-filter-bar--large">
                <div className="mi-filter-group">
                    <label>State</label>
                    <select value={selectedState} onChange={handleStateChange} disabled={filtersLoading} className="mi-select-large">
                        <option value="">Select State</option>
                        {stateList.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="mi-filter-group">
                    <label>District</label>
                    <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedState} className="mi-select-large">
                        <option value="">Select District</option>
                        {districtList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="mi-filter-group">
                    <label>Commodity</label>
                    <select value={commodityId} onChange={handleCommodityChange} disabled={!selectedDistrict} className="mi-select-large">
                        <option value="">Select Commodity</option>
                        {availableCommodities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <button className="mi-apply-btn mi-apply-btn--large" onClick={doFetch} disabled={loading || !commodityId}>
                    {loading ? 'Loading...' : 'Check Rates ›'}
                </button>
            </div>

            {/* ── Content ── */}
            {!hasFetched ? (
                <div className="mi-empty-state">
                    <div className="mi-empty-icon">🏷</div>
                    <h3>Select filters to view data</h3>
                    <p>Choose a State, District, and Commodity to see live market prices.</p>
                </div>
            ) : error ? (
                <div className="mi-error-banner">
                    <span>⚠ {error}</span>
                    <button className="mi-retry-btn" onClick={doFetch}>Retry</button>
                </div>
            ) : (
                <>
                    <div className="mi-grid">
                        {/* ── Price Hero ── */}
                        <div className="mi-card mi-card--hero">
                            <div className="mi-card-label">Modal Price · {card.commodity || commodityId}</div>
                            {loading ? <Skeleton lines={4} /> : (
                                <>
                                    <div className="mi-price-main">
                                        {card.modal_price
                                            ? <>₹<span className="mi-price-value">{card.modal_price.toLocaleString('en-IN')}</span><span className="mi-price-unit">/qtl</span></>
                                            : <span className="mi-price-value mi-no-data">No data</span>
                                        }
                                    </div>
                                    <div className="mi-price-meta">
                                        <span>{card.market_name || 'All'} · {card.district || selectedDistrict}, {card.state_name || selectedState}</span>
                                        {card.trend && <TrendBadge trend={card.trend} />}
                                    </div>
                                    {card.variety && card.variety !== '—' && (
                                        <div className="mi-price-variety">
                                            {card.variety}{card.grade && card.grade !== '—' ? ` · ${card.grade}` : ''}
                                        </div>
                                    )}
                                    <div className="mi-price-range">
                                        <span>Min ₹{card.min_price?.toLocaleString('en-IN') || '—'}</span>
                                        <span className="mi-range-sep">·</span>
                                        <span>Max ₹{card.max_price?.toLocaleString('en-IN') || '—'}</span>
                                        <span className="mi-range-sep">·</span>
                                        <span>Prev ₹{card.prev_price?.toLocaleString('en-IN') || '—'}</span>
                                    </div>
                                    {card.price_change != null && (
                                        <div className={`mi-price-change ${card.trend === 'up' ? 'mi-change-up' : card.trend === 'down' ? 'mi-change-down' : ''}`}>
                                            {card.trend === 'up' ? '▲' : card.trend === 'down' ? '▼' : '●'}{' '}
                                            ₹{Math.abs(card.price_change).toFixed(0)} ({Math.abs(card.change_pct || 0).toFixed(1)}%)
                                        </div>
                                    )}
                                    <div className="mi-price-date">As of {card.date || '—'}</div>
                                </>
                            )}
                        </div>

                        {/* ── Trade Signal ── */}
                        <div className="mi-card mi-card--rec">
                            <div className="mi-card-label">Trade Signal</div>
                            {loading ? <Skeleton /> : (
                                <>
                                    <div className="mi-rec-row">
                                        <RecBadge action={rec.action || 'HOLD'} />
                                        <span className="mi-rec-conf">{rec.confidence || 0}% confidence</span>
                                    </div>
                                    <div className="mi-rec-reason">{rec.reason || 'Analyzing signals…'}</div>
                                    {rec.score != null && (
                                        <div className="mi-rec-score">Signal score: {rec.score > 0 ? '+' : ''}{rec.score}</div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* ── 14-Day Sparkline ── */}
                        <div className="mi-card mi-card--chart">
                            <div className="mi-card-label">Price Trend · {chart.labels?.length || 0} days</div>
                            {loading ? <Skeleton lines={2} /> : (
                                <>
                                    <Sparkline prices={chart.price || []} width={300} height={64} />
                                    <div className="mi-chart-labels">
                                        {chart.labels?.length > 0 && (
                                            <>
                                                <span>{chart.labels[0]}</span>
                                                <span>{chart.labels[chart.labels.length - 1]}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mi-chart-meta">
                                        {mom.change_pct != null && (
                                            <span className={mom.change_pct >= 0 ? 'mi-change-up' : 'mi-change-down'}>
                                                {mom.change_pct >= 0 ? '+' : ''}{mom.change_pct}% over {mom.period_days || 0}d
                                            </span>
                                        )}
                                        {mom.high > 0 && (
                                            <span>H ₹{mom.high?.toLocaleString('en-IN')} · L ₹{mom.low?.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── Momentum ── */}
                        <div className="mi-card">
                            <div className="mi-card-label">Momentum</div>
                            {loading ? <Skeleton /> : (
                                <>
                                    <div className={`mi-stat-value mi-momentum-${mom.momentum || 'neutral'}`}>
                                        {mom.momentum ? mom.momentum.charAt(0).toUpperCase() + mom.momentum.slice(1) : '—'}
                                    </div>
                                    <div className="mi-stat-sub">Volatility ₹{mom.volatility?.toFixed(0) || '—'}/day</div>
                                    <div className="mi-stat-hint">
                                        {mom.high > 0 ? `Range ₹${mom.low?.toLocaleString('en-IN')} – ₹${mom.high?.toLocaleString('en-IN')}` : 'Insufficient data'}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* ── Buyer Signal ── */}
                        <div className="mi-card">
                            <div className="mi-card-label">Market Signal</div>
                            {loading ? <Skeleton /> : (
                                <>
                                    <div className="mi-stat-value" style={{ fontSize: '1.1rem' }}>{card.buyer_signal || '—'}</div>
                                    <div className="mi-stat-sub">
                                        {card.trend === 'up' ? 'Prices rising — sellers favoured'
                                            : card.trend === 'down' ? 'Prices falling — buyers favoured'
                                                : 'Market in equilibrium'}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Data Records Table ── */}
                    <div className="mi-records-section">
                        <div className="mi-records-header">
                            <h3 className="mi-records-title">📋 Variety-wise Daily Market Prices — {commodityId}</h3>
                            {recordsTotal > 0 && (
                                <span className="mi-records-count">
                                    Showing {showFrom}–{showTo} of {recordsTotal.toLocaleString('en-IN')} records
                                </span>
                            )}
                        </div>

                        {recordsLoading ? (
                            <div className="mi-records-loading">
                                <div className="mi-records-loading-spinner" />
                                <span>Loading records…</span>
                            </div>
                        ) : records.length === 0 ? (
                            <div className="mi-records-empty">No records found for this commodity.</div>
                        ) : (
                            <>
                                <div className="mi-table-wrap">
                                    <table className="mi-records-table">
                                        <thead>
                                            <tr>
                                                <th>State</th>
                                                <th>District</th>
                                                <th>Market</th>
                                                <th>Commodity</th>
                                                <th>Variety</th>
                                                <th>Grade</th>
                                                <th>Arrival Date</th>
                                                <th className="mi-th-num">Min Price</th>
                                                <th className="mi-th-num">Max Price</th>
                                                <th className="mi-th-num">Modal Price</th>
                                                <th>Code</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {records.map((r, idx) => (
                                                <tr key={idx} className={idx % 2 === 0 ? 'mi-row-even' : 'mi-row-odd'}>
                                                    <td>{r.state}</td>
                                                    <td>{r.district}</td>
                                                    <td>{r.market}</td>
                                                    <td>{r.commodity}</td>
                                                    <td>{r.variety}</td>
                                                    <td>{r.grade}</td>
                                                    <td>{r.arrival_date}</td>
                                                    <td className="mi-td-num">₹{r.min_price.toLocaleString('en-IN')}</td>
                                                    <td className="mi-td-num">₹{r.max_price.toLocaleString('en-IN')}</td>
                                                    <td className="mi-td-num mi-td-modal">₹{r.modal_price.toLocaleString('en-IN')}</td>
                                                    <td>{r.commodity_code}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <div className="mi-pagination">
                                        <button className="mi-page-btn" disabled={recordsPage <= 1}
                                            onClick={() => handlePageChange(recordsPage - 1)}>← Previous</button>
                                        <div className="mi-page-info">
                                            Page <strong>{recordsPage}</strong> of <strong>{totalPages}</strong>
                                        </div>
                                        <button className="mi-page-btn" disabled={recordsPage >= totalPages}
                                            onClick={() => handlePageChange(recordsPage + 1)}>Next →</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
