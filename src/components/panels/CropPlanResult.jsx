import React from 'react';
import { motion } from 'framer-motion';
import {
    Leaf, TrendingUp, Wallet, Clock, Sun, Droplets, AlertTriangle,
    CheckCircle, ArrowRight, Sparkles, BarChart3, Calendar
} from 'lucide-react';

/**
 * Generate a crop plan based on onboarding data.
 * In production this would call an AI endpoint — for now produces deterministic results.
 */
export function generateCropPlan(onboardingData) {
    const commodity = onboardingData?.primary_commodity || 'Banana';
    const capital = onboardingData?.capital_amount || 200000;
    const landSize = parseFloat(onboardingData?.land_size) || 2;
    const techs = onboardingData?.technologies || [];
    const crops = onboardingData?.crop_preferences || [];

    const cropDb = {
        Banana: { emoji: '🍌', variety: 'Grand Naine / G9', roi: 45, harvestDays: 270, climate: 88, risk: 'low', reason: 'High demand in your region, suits tropical climate with good irrigation. G9 variety offers consistent yield and market premium.' },
        Tomato: { emoji: '🍅', variety: 'Hybrid NS-585', roi: 60, harvestDays: 90, climate: 82, risk: 'medium', reason: 'Quick harvest cycle with high ROI potential. Requires careful pest management but local mandi demand is strong.' },
        Rice: { emoji: '🌾', variety: 'Basmati 1121', roi: 35, harvestDays: 150, climate: 90, risk: 'low', reason: 'Staple crop with stable government MSP support. Basmati commands export-grade premium pricing in major mandis.' },
        Onion: { emoji: '🧅', variety: 'Agrifound Light Red', roi: 55, harvestDays: 120, climate: 78, risk: 'medium', reason: 'High price volatility creates profit opportunities. Good storage life allows strategic selling at peak prices.' },
        Potato: { emoji: '🥔', variety: 'Kufri Jyoti', roi: 40, harvestDays: 100, climate: 75, risk: 'low', reason: 'Reliable yields with established supply chain. Cold storage infrastructure in your region supports off-season sales.' },
        Wheat: { emoji: '🌾', variety: 'HD-2967', roi: 30, harvestDays: 140, climate: 85, risk: 'low', reason: 'Government procurement ensures stable returns. Low input cost and well-suited to your soil type and climate zone.' },
        Cotton: { emoji: '🏵️', variety: 'Bt Cotton MCH-6', roi: 50, harvestDays: 180, climate: 80, risk: 'medium', reason: 'Strong export demand and textile industry linkage. Bt variety offers pest resistance reducing chemical inputs.' },
        Soyabean: { emoji: '🫘', variety: 'JS-9560', roi: 38, harvestDays: 110, climate: 82, risk: 'low', reason: 'Dual revenue from oil extraction and meal. Growing health food market driving premium prices for organic variants.' },
    };

    const primary = cropDb[commodity] || cropDb['Banana'];
    const investmentPerAcre = Math.round(capital / (landSize || 1));

    const altNames = Object.keys(cropDb).filter(k => k !== commodity).slice(0, 3);
    const alternatives = altNames.map(name => ({
        ...cropDb[name],
        name,
    }));

    const hasTech = techs.length > 0 && !techs.includes('traditional');
    const techSuggestion = hasTech ? {
        title: techs.includes('hydroponics') ? 'Hydroponic Setup' : techs.includes('drip_irrigation') ? 'Drip Irrigation System' : techs.includes('polyhouse') ? 'Polyhouse Farming' : 'Smart Farming Kit',
        description: techs.includes('hydroponics')
            ? 'Soilless cultivation can increase yields by 30-50% with precise nutrient control and year-round production capability.'
            : techs.includes('drip_irrigation')
                ? 'Drip irrigation saves 40-60% water and delivers nutrients directly to roots, improving yield quality and consistency.'
                : techs.includes('polyhouse')
                    ? 'Protected cultivation shields crops from weather extremes, enabling premium off-season produce at 3-5x market rates.'
                    : 'Sensor-based monitoring with automated alerts for soil moisture, pest pressure, and weather anomalies.',
        setupCost: techs.includes('hydroponics') ? 150000 : techs.includes('polyhouse') ? 250000 : 80000,
        roiTimeline: techs.includes('polyhouse') ? '18-24 months' : '6-12 months',
    } : null;

    const breakdown = [
        { label: 'Seeds & Inputs', amount: Math.round(capital * 0.25), percentage: 25 },
        { label: 'Land Preparation', amount: Math.round(capital * 0.15), percentage: 15 },
        { label: 'Irrigation & Water', amount: Math.round(capital * 0.18), percentage: 18 },
        { label: 'Fertilizers & Pest Control', amount: Math.round(capital * 0.22), percentage: 22 },
        { label: 'Labour & Operations', amount: Math.round(capital * 0.12), percentage: 12 },
        { label: 'Contingency Fund', amount: Math.round(capital * 0.08), percentage: 8 },
    ];

    const timeline = [
        { name: 'Soil Prep', duration: '2 weeks', icon: '🌍' },
        { name: 'Sowing', duration: '1 week', icon: '🌱' },
        { name: 'Growth', duration: `${Math.round(primary.harvestDays * 0.4)} days`, icon: '🌿' },
        { name: 'Flowering', duration: `${Math.round(primary.harvestDays * 0.25)} days`, icon: '🌸' },
        { name: 'Harvest', duration: `${Math.round(primary.harvestDays * 0.1)} days`, icon: '🌾' },
        { name: 'Market', duration: '1-2 weeks', icon: '🏪' },
    ];

    const risks = [
        `Seasonal weather variations may affect ${commodity} yield by 10-15%`,
        'Market price fluctuations — consider diversifying with 1-2 companion crops',
        `Pest/disease pressure during monsoon — maintain a ₹${Math.round(capital * 0.05 / 1000)}K emergency fund`,
        'Input cost inflation (fertilizers, fuel) — lock in early-season bulk purchases',
    ];

    return {
        primary: { name: commodity, ...primary, investment: investmentPerAcre },
        alternatives,
        techSuggestion,
        breakdown,
        timeline,
        risks,
        landSize,
        totalInvestment: capital,
        expectedRevenue: Math.round(capital * (1 + primary.roi / 100)),
    };
}


export default function CropPlanResult({ plan, onContinue, embedded = false }) {
    if (!plan) return null;

    const Wrapper = embedded ? 'div' : 'div';
    const wrapperClass = embedded ? 'cp-embedded' : 'cp-screen';

    return (
        <div className={wrapperClass}>
            <div className="cp-container">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="cp-header">
                    <div className="cp-header-icon">
                        <Sparkles size={28} />
                    </div>
                    <h1 className="cp-header-title">Your Personalized Crop Plan 🌾</h1>
                    <p className="cp-header-sub">Based on your inputs, here's our AI-generated recommendation</p>
                </motion.div>

                {/* Primary Recommendation */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="cp-primary-card">
                    <div className="cp-primary-banner">
                        <CheckCircle size={18} />
                        <span>Recommended Primary Crop</span>
                    </div>
                    <div className="cp-primary-body">
                        <div className="cp-primary-top">
                            <div className="cp-primary-crop">
                                <span className="cp-primary-emoji">{plan.primary.emoji}</span>
                                <div>
                                    <h2 className="cp-primary-name">{plan.primary.name}</h2>
                                    <p className="cp-primary-variety">{plan.primary.variety}</p>
                                </div>
                            </div>
                            <span className={`cp-risk-badge cp-risk-badge--${plan.primary.risk}`}>
                                {plan.primary.risk} risk
                            </span>
                        </div>

                        <div className="cp-stat-grid">
                            <div className="cp-stat cp-stat--green">
                                <TrendingUp size={18} />
                                <p className="cp-stat-value">{plan.primary.roi}%</p>
                                <p className="cp-stat-label">Expected ROI</p>
                            </div>
                            <div className="cp-stat cp-stat--blue">
                                <Wallet size={18} />
                                <p className="cp-stat-value">₹{(plan.primary.investment / 1000).toFixed(0)}K</p>
                                <p className="cp-stat-label">Investment</p>
                            </div>
                            <div className="cp-stat cp-stat--amber">
                                <Clock size={18} />
                                <p className="cp-stat-value">{plan.primary.harvestDays}</p>
                                <p className="cp-stat-label">Days to Harvest</p>
                            </div>
                            <div className="cp-stat cp-stat--purple">
                                <Sun size={18} />
                                <p className="cp-stat-value">{plan.primary.climate}%</p>
                                <p className="cp-stat-label">Climate Match</p>
                            </div>
                        </div>

                        <div className="cp-reason-box">
                            <h4>Why this crop?</h4>
                            <p>{plan.primary.reason}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Alternatives */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="cp-section-title">Alternative Crops</h3>
                    <div className="cp-alt-grid">
                        {plan.alternatives.map((crop, i) => (
                            <div key={i} className="cp-alt-card">
                                <div className="cp-alt-top">
                                    <span className="cp-alt-emoji">{crop.emoji}</span>
                                    <div>
                                        <p className="cp-alt-name">{crop.name}</p>
                                        <span className={`cp-risk-badge cp-risk-badge--${crop.risk} cp-risk-badge--sm`}>{crop.risk} risk</span>
                                    </div>
                                </div>
                                <div className="cp-alt-roi">
                                    <span>ROI</span>
                                    <span className="cp-alt-roi-value">{crop.roi}%</span>
                                </div>
                                <div className="cp-progress-bar">
                                    <div className="cp-progress-fill" style={{ width: `${Math.min(crop.roi * 1.5, 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Tech Suggestion */}
                {plan.techSuggestion && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="cp-tech-card">
                        <div className="cp-tech-icon">
                            <Droplets size={22} />
                        </div>
                        <div className="cp-tech-body">
                            <h4>{plan.techSuggestion.title}</h4>
                            <p>{plan.techSuggestion.description}</p>
                            <div className="cp-tech-meta">
                                <span><strong>Setup:</strong> ₹{(plan.techSuggestion.setupCost / 1000).toFixed(0)}K</span>
                                <span><strong>ROI Timeline:</strong> {plan.techSuggestion.roiTimeline}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Investment Breakdown */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="cp-card">
                    <h3 className="cp-card-title">
                        <BarChart3 size={18} className="cp-icon--blue" /> Investment Breakdown
                    </h3>
                    <div className="cp-breakdown-list">
                        {plan.breakdown.map((item, i) => (
                            <div key={i} className="cp-breakdown-row">
                                <span className="cp-breakdown-label">{item.label}</span>
                                <div className="cp-breakdown-right">
                                    <div className="cp-breakdown-bar">
                                        <div className="cp-breakdown-bar-fill" style={{ width: `${item.percentage}%` }} />
                                    </div>
                                    <span className="cp-breakdown-amount">₹{(item.amount / 1000).toFixed(0)}K</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Timeline */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="cp-card">
                    <h3 className="cp-card-title">
                        <Calendar size={18} className="cp-icon--amber" /> Cultivation Timeline
                    </h3>
                    <div className="cp-timeline">
                        {plan.timeline.map((phase, i) => (
                            <React.Fragment key={i}>
                                <div className="cp-timeline-step">
                                    <div className={`cp-timeline-dot ${i === 0 ? 'cp-timeline-dot--start' : i === plan.timeline.length - 1 ? 'cp-timeline-dot--end' : ''}`}>
                                        <span>{phase.icon}</span>
                                    </div>
                                    <p className="cp-timeline-name">{phase.name}</p>
                                    <p className="cp-timeline-dur">{phase.duration}</p>
                                </div>
                                {i < plan.timeline.length - 1 && <div className="cp-timeline-line" />}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>

                {/* Risk Assessment */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="cp-risk-card">
                    <AlertTriangle size={22} className="cp-risk-card-icon" />
                    <div>
                        <h4>Risk Assessment</h4>
                        <ul className="cp-risk-list">
                            {plan.risks.map((risk, i) => (
                                <li key={i}>• {risk}</li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* CTA */}
                {onContinue && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <button className="btn btn-primary cp-cta" onClick={onContinue}>
                            Start My Farming Journey <ArrowRight size={18} />
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
