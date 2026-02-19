import AgentCard from '../ui/AgentCard';
import StatusBadge from '../ui/StatusBadge';
import { useAppState } from '../../context/AppContext';

export default function RecommendationPanel() {
    const { state } = useAppState();
    const data = state.orchestrationResult;

    if (!data) {
        return (
            <div className="panel-full-width">
                <AgentCard
                    title="Final Recommendations"
                    subtitle="AI-synthesized action plan"
                    icon="📋"
                    accentColor="var(--accent-green)"
                    statusBadge={<StatusBadge status="Pending" />}
                >
                    <div className="loading-state" style={{ minHeight: 100 }}>
                        <span style={{ fontSize: '2rem', opacity: 0.3 }}>📋</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            Run orchestration to generate AI-powered recommendations
                        </span>
                    </div>
                </AgentCard>
            </div>
        );
    }

    return (
        <div className="panel-full-width">
            <AgentCard
                title="Final Recommendations"
                subtitle="AI-synthesized action plan via Groq"
                icon="📋"
                accentColor="var(--accent-green)"
                statusBadge={<StatusBadge status={data.risk_level || 'Moderate'} />}
            >
                {/* Action Summary */}
                <div className="recommendation-section">
                    <div className="recommendation-section-title">
                        <span>🎯</span> Action Summary
                    </div>
                    <p className="recommendation-text">{data.action_summary}</p>
                </div>

                {/* Biological Controls */}
                {data.biological_controls && data.biological_controls.length > 0 && (
                    <div className="recommendation-section">
                        <div className="recommendation-section-title">
                            <span>🌿</span> Preventive Biological Controls
                        </div>
                        {data.biological_controls.map((control, idx) => (
                            <div key={idx} className="recommendation-item">
                                <span className="recommendation-item-icon">✦</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                                        {control.name}
                                    </div>
                                    <div>{control.application}</div>
                                </div>
                                <StatusBadge status={control.priority === 'High' ? 'High' : 'Moderate'} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Chemical Advisory */}
                {data.chemical_advisory && (
                    <div className="advisory-box">
                        <div className="advisory-title">
                            ⚗️ Chemical Usage Advisory — {data.chemical_advisory.recommendation}
                        </div>
                        <p>{data.chemical_advisory.notes}</p>
                        {data.chemical_advisory.restrictions && data.chemical_advisory.restrictions.length > 0 && (
                            <ul className="restriction-list">
                                {data.chemical_advisory.restrictions.map((r, idx) => (
                                    <li key={idx}>{r}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </AgentCard>
        </div>
    );
}
