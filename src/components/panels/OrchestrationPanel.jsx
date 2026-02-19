import AgentCard from '../ui/AgentCard';
import StatusBadge from '../ui/StatusBadge';
import ProgressBar from '../ui/ProgressBar';
import { useAppState } from '../../context/AppContext';
import { runOrchestration } from '../../services/api';

export default function OrchestrationPanel() {
    const { state, dispatch } = useAppState();
    const {
        visionResult, climateResult, satelliteResult,
        orchestrationResult: data, orchestrationLoading: loading, orchestrationError: error,
    } = state;

    const handleRunOrchestration = async () => {
        dispatch({ type: 'ORCHESTRATION_LOADING' });
        try {
            const result = await runOrchestration({
                vision: visionResult || null,
                climate: climateResult || null,
                satellite: satelliteResult || null,
            });
            dispatch({ type: 'ORCHESTRATION_SUCCESS', payload: result });
        } catch (err) {
            dispatch({ type: 'ORCHESTRATION_ERROR', payload: err.message });
        }
    };

    const agentReadiness = [
        { name: 'Vision Agent', ready: !!visionResult },
        { name: 'Climate Agent', ready: !!climateResult },
        { name: 'Satellite Agent', ready: !!satelliteResult },
    ];

    const readyCount = agentReadiness.filter(a => a.ready).length;

    return (
        <div className="panel-full-width">
            <AgentCard
                title="Orchestration Engine"
                subtitle="Multi-agent consensus via Groq Llama 3.3 70B"
                icon="⚙️"
                accentColor="var(--accent-purple)"
                statusBadge={
                    loading ? <StatusBadge status="Pending" /> :
                        data ? <StatusBadge status="Verified" /> :
                            <StatusBadge status="Pending" />
                }
            >
                {/* Agent readiness */}
                <table className="orch-table">
                    <thead>
                        <tr>
                            <th>Agent</th>
                            <th>Data Status</th>
                            {data && <th>Orchestrator Verdict</th>}
                            {data && <th>Confidence</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {agentReadiness.map((agent, idx) => {
                            const orchAgent = data?.agents?.find(a =>
                                a.name.toLowerCase().includes(agent.name.toLowerCase().split(' ')[0])
                            );
                            return (
                                <tr key={idx}>
                                    <td style={{ fontWeight: 600 }}>{agent.name}</td>
                                    <td>
                                        <StatusBadge status={agent.ready ? 'Verified' : 'Pending'} />
                                    </td>
                                    {data && (
                                        <td>
                                            {orchAgent
                                                ? <StatusBadge status={orchAgent.status} />
                                                : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                        </td>
                                    )}
                                    {data && (
                                        <td style={{ fontWeight: 600 }}>
                                            {orchAgent ? `${orchAgent.confidence}%` : '—'}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Orchestration results */}
                {data && (
                    <>
                        <div className="field-row">
                            <span className="field-label">Overall Status</span>
                            <span className="field-value" style={{
                                color: data.risk_level === 'High' ? 'var(--accent-red)' :
                                    data.risk_level === 'Moderate' ? 'var(--accent-amber)' :
                                        'var(--accent-green)'
                            }}>
                                {data.overall_status}
                            </span>
                        </div>

                        <ProgressBar
                            label="Consensus Score"
                            value={data.consensus_score}
                            colorClass="purple"
                        />

                        {data.conflicts && data.conflicts.length > 0 && (
                            <div>
                                {data.conflicts.map((conflict, idx) => (
                                    <div key={idx} className="conflict-alert">
                                        <span>⚠️</span>
                                        <span>{conflict}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {error && <div className="error-alert">⚠️ {error}</div>}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleRunOrchestration}
                        disabled={loading || readyCount === 0}
                    >
                        {loading ? (
                            <>
                                <span className="spinner spinner-sm"></span>
                                Orchestrating with Groq…
                            </>
                        ) : (
                            <>▶ Run Orchestration</>
                        )}
                    </button>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {readyCount}/3 agents have data
                        {readyCount === 0 && ' — upload an image or wait for climate/satellite data'}
                    </span>
                </div>
            </AgentCard>
        </div>
    );
}
