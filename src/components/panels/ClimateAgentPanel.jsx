import { useEffect } from 'react';
import AgentCard from '../ui/AgentCard';
import StatusBadge from '../ui/StatusBadge';
import MetricBadge from '../ui/MetricBadge';
import ProgressBar from '../ui/ProgressBar';
import { useAppState } from '../../context/AppContext';
import { getClimateRisk } from '../../services/api';

export default function ClimateAgentPanel() {
    const { state, dispatch } = useAppState();
    const { climateResult: data, climateLoading: loading, climateError: error, location } = state;

    // Auto-fetch when location changes
    useEffect(() => {
        let cancelled = false;
        async function fetchClimate() {
            dispatch({ type: 'CLIMATE_LOADING' });
            try {
                const result = await getClimateRisk(location.lat, location.lon);
                if (!cancelled) dispatch({ type: 'CLIMATE_SUCCESS', payload: result });
            } catch (err) {
                if (!cancelled) dispatch({ type: 'CLIMATE_ERROR', payload: err.message });
            }
        }
        fetchClimate();
        return () => { cancelled = true; };
    }, [location.lat, location.lon, dispatch]);

    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return 'var(--accent-red)';
            case 'Moderate': return 'var(--accent-amber)';
            case 'Low': return 'var(--accent-green)';
            default: return 'var(--text-primary)';
        }
    };

    const getProgressColor = (prob) => {
        if (prob >= 70) return 'red';
        if (prob >= 40) return 'amber';
        return 'green';
    };

    return (
        <AgentCard
            title="Climate Risk Agent"
            subtitle={`Weather analysis · ${state.locationName || `${location.lat}, ${location.lon}`}`}
            icon="🌡️"
            accentColor="var(--accent-amber)"
            statusBadge={
                loading ? <StatusBadge status="Pending" /> :
                    error ? <StatusBadge status="Conflict" /> :
                        data ? <StatusBadge status="Verified" /> :
                            <StatusBadge status="Pending" />
            }
        >
            {loading && (
                <div className="loading-state">
                    <span className="spinner"></span>
                    <span>Fetching weather data…</span>
                </div>
            )}

            {error && <div className="error-alert">⚠️ {error}</div>}

            {data && !loading && (
                <>
                    <div className="metric-row">
                        <MetricBadge label="Temperature" value={data.temperature} unit="°C" color="var(--accent-red)" />
                        <MetricBadge label="Humidity" value={data.humidity} unit="%" color="var(--accent-blue)" />
                        <MetricBadge label="Wind Speed" value={data.wind_speed} unit="km/h" color="var(--accent-cyan)" />
                        <MetricBadge label="Rainfall" value={data.rainfall} unit="mm" color="var(--accent-purple)" />
                    </div>

                    <div className="field-row">
                        <span className="field-label">Weather Risk Level</span>
                        <span className="field-value" style={{ color: getRiskColor(data.risk_level) }}>
                            ⚠ {data.risk_level}
                        </span>
                    </div>

                    <ProgressBar
                        label="Outbreak Probability"
                        value={data.outbreak_probability}
                        colorClass={getProgressColor(data.outbreak_probability)}
                    />

                    <p className="recommendation-text">{data.forecast_summary}</p>

                    <div className="field-row">
                        <span className="field-label">Last Updated</span>
                        <span className="field-value">{data.last_updated}</span>
                    </div>
                </>
            )}
        </AgentCard>
    );
}
