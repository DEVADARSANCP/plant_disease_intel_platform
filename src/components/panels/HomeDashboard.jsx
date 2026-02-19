import { useEffect } from 'react';
import { useAppState } from '../../context/AppContext';
import { runOrchestration } from '../../services/api';

const features = [
    { id: 'market', label: 'Market Intelligence', icon: '↗', badge: null },
    { id: 'community', label: 'Community', icon: '👥', badge: '5' },
    { id: 'dev-planner', label: 'Dev Planner', icon: '📖', badge: null },
    { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖', badge: null },
    { id: 'dashboard', label: 'Outbreak Analysis', icon: '🧬', badge: '⚠' },
    { id: 'crop-planning', label: 'Crop Planning', icon: '🌱', badge: null },
    { id: 'roi-calculator', label: 'ROI Calculator', icon: '🧮', badge: null },
    { id: 'econ-dashboard', label: 'Econ Dashboard', icon: '📊', badge: null },
];

// ── Skeleton loader for a single stat card ──
function StatSkeleton() {
    return (
        <div className="home-stat-card">
            <div className="skeleton skeleton-label" />
            <div className="skeleton skeleton-value" />
            <div className="skeleton skeleton-sub" />
            <div className="skeleton skeleton-sub" />
        </div>
    );
}

// ── Typical mandi prices (₹ per quintal) for common crops ──
const FALLBACK_PRICES = {
    Banana: { price: 2850, market: 'Kottayam', trend: 'up', change: 120 },
    Tomato: { price: 3200, market: 'Nashik', trend: 'up', change: 250 },
    Rice: { price: 3800, market: 'Karnal', trend: 'stable', change: 45 },
    Onion: { price: 2400, market: 'Lasalgaon', trend: 'down', change: -180 },
    Potato: { price: 1850, market: 'Agra', trend: 'stable', change: 30 },
    Wheat: { price: 2275, market: 'Indore', trend: 'up', change: 75 },
    Cotton: { price: 6800, market: 'Rajkot', trend: 'up', change: 350 },
    Soyabean: { price: 4500, market: 'Indore', trend: 'stable', change: 60 },
};

// ── Derive stat cards from orchestrator response ──
function buildStats(result, onboardingData) {
    const market = result?.market || {};
    const climate = result?.climate || {};

    // Card 1: Mandi Price — prefer orchestrator, fallback to onboarding commodity
    const obCommodity = onboardingData?.primary_commodity || 'Banana';
    const fallback = FALLBACK_PRICES[obCommodity] || FALLBACK_PRICES['Banana'];

    const price = market.mandi_price || fallback.price;
    const commodity = market.commodity || obCommodity;
    const trend = market.trend || fallback.trend;
    const trendSign = trend === 'up' ? '+' : trend === 'down' ? '-' : '';
    const changeVal = market.price_change != null ? market.price_change : fallback.change;
    const priceChange = `${trendSign}₹${Math.abs(changeVal).toFixed(0)}`;
    const marketName = market.market_id || fallback.market;

    // Card 2: AI Recommendation
    const aiRec = result?.ai_recommendation || 'HOLD';
    const aiReason = result?.recommendation_reason || 'Analyzing market conditions…';
    const score = result?.consensus_score ?? 0;
    const recColor = aiRec === 'BUY' ? 'var(--accent-green)'
        : aiRec === 'SELL' ? 'var(--accent-red)'
            : 'var(--accent-amber)';

    // Card 3: Climate Risk
    const riskLevel = climate.risk_level || result?.risk_level || '—';
    const riskColor = riskLevel === 'High' ? 'var(--accent-red)'
        : riskLevel === 'Moderate' ? 'var(--accent-amber)'
            : 'var(--accent-green)';
    const outbreakProb = climate.outbreak_probability != null
        ? `${climate.outbreak_probability}% outbreak prob.`
        : 'No climate data';

    // Card 4: Buyer Signal
    const buyerSignal = market.buyer_signal || '—';
    const arrival = market.arrival != null ? `${market.arrival}T arrival` : 'No arrival data';
    const buyerColor = buyerSignal === 'Strong Demand' || buyerSignal === 'Scarcity Premium'
        ? 'var(--accent-green)' : 'var(--accent-amber)';

    return [
        {
            label: `${commodity} Mandi Price`,
            value: `₹${price.toLocaleString('en-IN')}`,
            sub1: `/qtl · ${marketName} Market`,
            sub2: priceChange,
            valueColor: 'var(--text-primary)',
            sub2Color: trend === 'up' ? 'var(--accent-green)' : trend === 'down' ? 'var(--accent-red)' : 'var(--text-muted)',
        },
        {
            label: 'AI Recommendation',
            value: aiRec,
            sub1: aiReason.length > 60 ? aiReason.slice(0, 57) + '…' : aiReason,
            sub2: `${score}% confidence`,
            valueColor: recColor,
            sub2Color: 'var(--text-muted)',
        },
        {
            label: 'Climate Risk',
            value: riskLevel,
            sub1: outbreakProb,
            sub2: climate.last_updated ? `Updated ${climate.last_updated}` : 'Live',
            valueColor: riskColor,
            sub2Color: 'var(--text-muted)',
        },
        {
            label: 'Buyer Signal',
            value: buyerSignal,
            sub1: arrival,
            sub2: trend !== 'unknown' ? `Price ${trend}` : 'No data',
            valueColor: buyerColor,
            sub2Color: 'var(--text-muted)',
        },
    ];
}

export default function HomeDashboard({ onNavigate }) {
    const { state, dispatch } = useAppState();
    const { regionId, commodityId, location, orchestrationResult, orchestrationLoading, orchestrationError } = state;

    // Fetch from orchestrator whenever filters change
    useEffect(() => {
        if (orchestrationResult) return; // already have fresh data

        dispatch({ type: 'ORCHESTRATION_LOADING' });

        runOrchestration({
            region: regionId,
            commodity: commodityId,
            lat: location.lat,
            lon: location.lon,
        })
            .then((result) => dispatch({ type: 'ORCHESTRATION_SUCCESS', payload: result }))
            .catch((err) => dispatch({ type: 'ORCHESTRATION_ERROR', payload: err.message }));
    }, [regionId, commodityId]);

    const stats = orchestrationResult ? buildStats(orchestrationResult, state.onboardingData) : null;

    return (
        <div className="home-dashboard">
            {/* ── Hero Banner ── */}
            <div className="home-hero">
                <div className="home-hero-live">
                    <span className="home-hero-dot" />
                    Live Market Data
                </div>
                <h1 className="home-hero-title">
                    AI Economic Intelligence<br />Platform for Farmers
                </h1>
                <p className="home-hero-sub">
                    Price forecasting · Climate risk · Buyer matching · AI-driven farm planning
                </p>
                <div className="home-hero-actions">
                    <button className="btn home-btn-primary" onClick={() => onNavigate('market')}>
                        View Market Intel &rsaquo;
                    </button>
                    <button className="btn home-btn-outline" onClick={() => onNavigate('ai-assistant')}>
                        Ask AI Assistant 🤖
                    </button>
                </div>
            </div>

            {/* ── Stats Row ── */}
            <div className="home-stats-row">
                {orchestrationLoading || !stats
                    ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
                    : orchestrationError
                        ? (
                            <div className="home-error-banner">
                                ⚠ Could not load live data: {orchestrationError}
                                <button
                                    className="btn btn-outline home-retry-btn"
                                    onClick={() => dispatch({ type: 'ORCHESTRATION_ERROR', payload: null }) || dispatch({ type: 'SET_FILTER', payload: {} })}
                                >
                                    Retry
                                </button>
                            </div>
                        )
                        : stats.map((s, i) => (
                            <div className="home-stat-card" key={i}>
                                <div className="home-stat-label">{s.label}</div>
                                <div className="home-stat-value" style={{ color: s.valueColor }}>{s.value}</div>
                                <div className="home-stat-sub1">{s.sub1}</div>
                                <div className="home-stat-sub2" style={{ color: s.sub2Color }}>{s.sub2}</div>
                            </div>
                        ))
                }
            </div>

            {/* ── Platform Features ── */}
            <div className="home-features-section">
                <h2 className="home-features-title">Platform Features</h2>
                <div className="home-features-grid">
                    {features.map((f) => (
                        <div
                            className="home-feature-card"
                            key={f.id}
                            onClick={() => onNavigate(f.id)}
                        >
                            <div className="home-feature-top">
                                <span className="home-feature-icon">{f.icon}</span>
                                {f.badge && (
                                    <span className={`home-feature-badge ${f.badge === '⚠' ? 'home-feature-badge--warn' : ''}`}>
                                        {f.badge}
                                    </span>
                                )}
                            </div>
                            <div className="home-feature-label">{f.label}</div>
                            <div className="home-feature-explore">Explore &rsaquo;</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
