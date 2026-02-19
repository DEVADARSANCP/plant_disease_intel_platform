export default function MetricBadge({ label, value, unit, color }) {
    return (
        <div className="metric-badge">
            <span className="metric-badge-label">{label}</span>
            <span className="metric-badge-value" style={{ color: color || 'var(--text-primary)' }}>
                {value}
                {unit && <span className="metric-badge-unit">{unit}</span>}
            </span>
        </div>
    );
}
